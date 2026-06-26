import { ADMIN_COOKIE_NAME } from "@shared/const";
import { VILLA_IDS } from "@shared/villas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  hashPassword,
  toSafeAdmin,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "../_core/auth";
import { getSessionCookieOptions } from "../_core/cookies";
import { getVapidPublicKey, notifyManualBooking, notifyNewWebsiteBooking } from "../_core/push";
import { getClientIp, checkRateLimit } from "../_core/rateLimit";
import { adminProcedure, masterProcedure, publicProcedure, router } from "../_core/trpc";
import { assertNoBookingOverlap, formatBookingRow, formatBookings } from "../bookingHelpers";
import { validateStayDates } from "../bookingOverlap";
import * as db from "../db";

const villaIdSchema = z.enum(VILLA_IDS);
const passwordSchema = z.string().superRefine((v, ctx) => {
  const err = validatePassword(v);
  if (err) ctx.addIssue({ code: "custom", message: err });
});

const bookingInputSchema = z.object({
  villaId: villaIdSchema,
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  numberOfGuests: z.number().int().min(1).max(10),
  guestName: z.string().min(2).max(255),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().max(32).optional().or(z.literal("")),
  guestNote: z.string().max(1000).optional(),
  adminNote: z.string().max(2000).optional(),
});

export const adminRouter = router({
  auth: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(3).max(64),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ip = getClientIp(ctx.req);
        if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Твърде много опити" });
        }

        const user = await db.getAdminUserByUsername(input.username);
        if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Грешно потребителско име или парола" });
        }

        const token = await createAdminSessionToken(user.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions);

        return { user: toSafeAdmin(user) };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: 0 });
      return { success: true as const };
    }),

    me: publicProcedure.query(({ ctx }) => {
      return ctx.user ? toSafeAdmin(ctx.user) : null;
    }),

    changePassword: adminProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const err = validatePassword(input.newPassword);
        if (err) throw new TRPCError({ code: "BAD_REQUEST", message: err });
        if (!(await verifyPassword(input.currentPassword, ctx.user.passwordHash))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Грешна текуща парола" });
        }
        await db.updateAdminPassword(ctx.user.id, await hashPassword(input.newPassword));
        return { success: true as const };
      }),
  }),

  bookings: router({
    list: adminProcedure
      .input(
        z
          .object({
            status: z.enum(["pending", "confirmed", "rejected"]).optional(),
            villaId: villaIdSchema.optional(),
            source: z.enum(["website", "manual"]).optional(),
            search: z.string().optional(),
            fromDate: z.string().date().optional(),
            toDate: z.string().date().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => formatBookings(await db.listBookings(input ?? {}))),

    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const row = await db.getBookingById(input.id);
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Резервацията не е намерена" });
        return formatBookingRow(row)!;
      }),

    calendar: adminProcedure
      .input(z.object({ fromDate: z.string().date(), toDate: z.string().date() }))
      .query(async ({ input }) => formatBookings(await db.getCalendarBookings(input.fromDate, input.toDate))),

    stats: adminProcedure.query(async () => ({
      pending: await db.countPendingBookings(),
    })),

    create: adminProcedure
      .input(
        bookingInputSchema.extend({
          status: z.enum(["pending", "confirmed"]).default("confirmed"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.status === "confirmed") {
          await assertNoBookingOverlap(input.villaId, input.checkInDate, input.checkOutDate);
        }

        const now = new Date();
        const id = await db.insertBooking({
          villaId: input.villaId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          numberOfGuests: input.numberOfGuests,
          guestName: input.guestName,
          guestEmail: input.guestEmail || null,
          guestPhone: input.guestPhone || null,
          guestNote: input.guestNote || null,
          adminNote: input.adminNote || null,
          status: input.status,
          source: "manual",
          createdByAdminId: ctx.user.id,
          processedAt: input.status !== "pending" ? now : null,
          processedByAdminId: input.status !== "pending" ? ctx.user.id : null,
        });

        const booking = await db.getBookingById(id);
        if (booking) {
          await notifyManualBooking(
            {
              id: booking.id,
              guestName: booking.guestName,
              villaId: booking.villaId,
              checkInDate: String(booking.checkInDate).slice(0, 10),
              checkOutDate: String(booking.checkOutDate).slice(0, 10),
              status: booking.status,
            },
            ctx.user.id,
            ctx.user.username
          );
        }

        return { id, success: true as const };
      }),

    update: adminProcedure
      .input(
        bookingInputSchema.partial().extend({
          id: z.number().int().positive(),
          status: z.enum(["pending", "confirmed", "rejected"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getBookingById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        const nextStatus = input.status ?? existing.status;
        const villaId = input.villaId ?? existing.villaId;
        const checkIn = input.checkInDate ?? String(existing.checkInDate).slice(0, 10);
        const checkOut = input.checkOutDate ?? String(existing.checkOutDate).slice(0, 10);

        if (nextStatus === "confirmed") {
          await assertNoBookingOverlap(villaId, checkIn, checkOut, input.id);
        }

        const statusChanged = nextStatus !== existing.status;
        await db.updateBooking(input.id, {
          villaId: input.villaId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          numberOfGuests: input.numberOfGuests,
          guestName: input.guestName,
          guestEmail: input.guestEmail === "" ? null : input.guestEmail,
          guestPhone: input.guestPhone === "" ? null : input.guestPhone,
          guestNote: input.guestNote,
          adminNote: input.adminNote,
          status: input.status,
          processedAt: statusChanged ? new Date() : existing.processedAt,
          processedByAdminId: statusChanged ? ctx.user.id : existing.processedByAdminId,
        });

        return { success: true as const };
      }),

    confirm: adminProcedure
      .input(z.object({ id: z.number().int().positive(), adminNote: z.string().max(2000).optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getBookingById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        const checkIn = String(existing.checkInDate).slice(0, 10);
        const checkOut = String(existing.checkOutDate).slice(0, 10);
        await assertNoBookingOverlap(existing.villaId, checkIn, checkOut, input.id);
        await db.updateBooking(input.id, {
          status: "confirmed",
          adminNote: input.adminNote ?? existing.adminNote,
          processedAt: new Date(),
          processedByAdminId: ctx.user.id,
        });
        return { success: true as const };
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number().int().positive(), adminNote: z.string().max(2000).optional() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getBookingById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateBooking(input.id, {
          status: "rejected",
          adminNote: input.adminNote ?? existing.adminNote,
          processedAt: new Date(),
          processedByAdminId: ctx.user.id,
        });
        return { success: true as const };
      }),
  }),

  pricing: router({
    get: adminProcedure.query(async () => {
      const [rows, extras] = await Promise.all([db.getAllVillaPricing(), db.getPricingExtras()]);
      return {
        rows: rows.map(r => ({
          ...r,
          checkInDate: undefined,
        })),
        extras,
      };
    }),

    update: adminProcedure
      .input(
        z.object({
          rows: z.array(
            z.object({
              villaId: villaIdSchema,
              tierKey: z.string(),
              tierLabel: z.string().min(1).max(128),
              winterPerNight: z.number().int().min(0).max(10000),
              summerPerNight: z.number().int().min(0).max(10000),
              sortOrder: z.number().int(),
            })
          ),
          extras: z
            .array(
              z.object({
                key: z.string(),
                label: z.string(),
                amountEur: z.number().int().min(0),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertVillaPricingRows(input.rows);
        if (input.extras) {
          for (const extra of input.extras) {
            await db.upsertPricingExtra(extra.key, extra.label, extra.amountEur);
          }
        }
        return { success: true as const };
      }),
  }),

  offers: router({
    list: adminProcedure.query(async () => {
      const rows = await db.listOffers();
      return rows.map(o => ({
        ...o,
        includes: JSON.parse(o.includesJson) as string[],
      }));
    }),

    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(2).max(64),
          title: z.string().min(2).max(255),
          priceEur: z.number().int().min(0),
          oldPriceEur: z.number().int().min(0),
          period: z.string().min(2).max(255),
          description: z.string().min(10),
          includes: z.array(z.string().min(1)).min(1),
          isPublished: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        if (input.isPublished && (await db.countPublishedOffers()) >= 2) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Максимум 2 публикувани оферти" });
        }
        const id = await db.insertOffer({
          slug: input.slug,
          title: input.title,
          priceEur: input.priceEur,
          oldPriceEur: input.oldPriceEur,
          period: input.period,
          description: input.description,
          includesJson: JSON.stringify(input.includes),
          isPublished: input.isPublished,
          sortOrder: 0,
        });
        return { id };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          slug: z.string().min(2).max(64).optional(),
          title: z.string().min(2).max(255).optional(),
          priceEur: z.number().int().min(0).optional(),
          oldPriceEur: z.number().int().min(0).optional(),
          period: z.string().min(2).max(255).optional(),
          description: z.string().min(10).optional(),
          includes: z.array(z.string().min(1)).optional(),
          isPublished: z.boolean().optional(),
          sortOrder: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await db.getOfferById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (input.isPublished && !existing.isPublished && (await db.countPublishedOffers()) >= 2) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Максимум 2 публикувани оферти" });
        }
        await db.updateOffer(input.id, {
          slug: input.slug,
          title: input.title,
          priceEur: input.priceEur,
          oldPriceEur: input.oldPriceEur,
          period: input.period,
          description: input.description,
          includesJson: input.includes ? JSON.stringify(input.includes) : undefined,
          isPublished: input.isPublished,
          sortOrder: input.sortOrder,
        });
        return { success: true as const };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteOffer(input.id);
        return { success: true as const };
      }),
  }),

  users: router({
    list: masterProcedure.query(async () => {
      const users = await db.listAdminUsers();
      return users.map(toSafeAdmin);
    }),

    create: masterProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const uErr = validateUsername(input.username);
        if (uErr) throw new TRPCError({ code: "BAD_REQUEST", message: uErr });
        const pErr = validatePassword(input.password);
        if (pErr) throw new TRPCError({ code: "BAD_REQUEST", message: pErr });
        const existing = await db.getAdminUserByUsername(input.username);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Потребителят вече съществува" });
        await db.createAdminUser({
          username: input.username,
          passwordHash: await hashPassword(input.password),
          isMaster: false,
        });
        return { success: true as const };
      }),

    delete: masterProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const target = await db.getAdminUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        if (target.isMaster) throw new TRPCError({ code: "FORBIDDEN", message: "Master admin не може да се изтрие" });
        if (target.id === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Не можете да изтриете себе си" });
        await db.deleteAdminUser(input.id);
        return { success: true as const };
      }),

    resetPassword: masterProcedure
      .input(z.object({ id: z.number().int().positive(), newPassword: z.string() }))
      .mutation(async ({ input }) => {
        const pErr = validatePassword(input.newPassword);
        if (pErr) throw new TRPCError({ code: "BAD_REQUEST", message: pErr });
        const target = await db.getAdminUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateAdminPassword(input.id, await hashPassword(input.newPassword));
        return { success: true as const };
      }),
  }),

  push: router({
    getVapidPublicKey: adminProcedure.query(() => ({
      publicKey: getVapidPublicKey(),
    })),

    subscribe: adminProcedure
      .input(
        z.object({
          endpoint: z.string().url(),
          p256dh: z.string().min(1),
          auth: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.upsertPushSubscription({
          adminUserId: ctx.user.id,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: ctx.req.headers["user-agent"]?.slice(0, 512),
        });
        return { success: true as const };
      }),

    unsubscribe: adminProcedure
      .input(z.object({ endpoint: z.string().url() }))
      .mutation(async ({ input }) => {
        await db.deletePushSubscription(input.endpoint);
        return { success: true as const };
      }),
  }),
});

export const publicContentRouter = router({
  getPricing: publicProcedure.query(async () => {
    const [rows, extras] = await Promise.all([db.getAllVillaPricing(), db.getPricingExtras()]);
    if (rows.length === 0) return null;
    return {
      rows: rows.map(r => ({
        villaId: r.villaId,
        tierKey: r.tierKey,
        tierLabel: r.tierLabel,
        winterPerNight: r.winterPerNight,
        summerPerNight: r.summerPerNight,
        sortOrder: r.sortOrder,
      })),
      extras: extras.map(e => ({ key: e.key, label: e.label, amountEur: e.amountEur })),
    };
  }),

  getOffers: publicProcedure.query(async () => {
    const rows = await db.getPublishedOffers();
    return rows.map(o => ({
      id: o.slug,
      title: o.title,
      priceEur: o.priceEur,
      oldPriceEur: o.oldPriceEur,
      period: o.period,
      description: o.description,
      includes: JSON.parse(o.includesJson) as string[],
    }));
  }),
});

export const publicBookingRouter = router({
  getOccupiedDates: publicProcedure
    .input(z.object({ villaId: villaIdSchema.optional() }).optional())
    .query(async ({ input }) => {
      const all = await db.listBookings({ status: "confirmed" }, 500);
      const filtered = input?.villaId ? all.filter(b => b.villaId === input.villaId) : all;
      return filtered.map(b => ({
        villaId: b.villaId,
        checkInDate: String(b.checkInDate).slice(0, 10),
        checkOutDate: String(b.checkOutDate).slice(0, 10),
      }));
    }),

  createRequest: publicProcedure
    .input(
      bookingInputSchema.extend({
        websiteHoneypot: z.string().max(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.websiteHoneypot) {
        return { success: true, message: "OK" };
      }

      const ip = getClientIp(ctx.req);
      if (!checkRateLimit(`booking:${ip}`, 3, 60 * 60 * 1000)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Моля, опитайте по-късно" });
      }

      try {
        validateStayDates(input.checkInDate, input.checkOutDate);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Invalid dates",
        });
      }

      if (!input.guestEmail?.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email is required" });
      }
      if (!input.guestPhone?.trim() || input.guestPhone.trim().length < 5) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Phone is required" });
      }

      const id = await db.insertBooking({
        villaId: input.villaId,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        numberOfGuests: input.numberOfGuests,
        guestName: input.guestName,
        guestEmail: input.guestEmail || null,
        guestPhone: input.guestPhone || null,
        guestNote: input.guestNote || null,
        adminNote: null,
        status: "pending",
        source: "website",
        createdByAdminId: null,
        processedAt: null,
        processedByAdminId: null,
      });

      const booking = await db.getBookingById(id);
      if (booking) {
        await notifyNewWebsiteBooking({
          id: booking.id,
          guestName: booking.guestName,
          villaId: booking.villaId,
          checkInDate: String(booking.checkInDate).slice(0, 10),
          checkOutDate: String(booking.checkOutDate).slice(0, 10),
        });
      }

      return { success: true, message: "Booking request submitted successfully", id };
    }),
});
