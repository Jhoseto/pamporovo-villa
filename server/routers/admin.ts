import { ADMIN_COOKIE_NAME } from "@shared/const";
import { BOOKING_STATUSES } from "@shared/bookingStatus";
import { optionalPhoneSchema } from "@shared/phoneSchema";
import { VILLA_IDS, TIER_KEYS } from "@shared/villas";
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
import { sendBookingConfirmationById, sendBookingConfirmationCardEmail } from "../_core/email";
import { getVapidPublicKey, notifyManualBooking, notifyNewWebsiteBooking } from "../_core/push";
import { getClientIp, checkRateLimit } from "../_core/rateLimit";
import { adminProcedure, masterProcedure, publicProcedure, router } from "../_core/trpc";
import {
  assertNoBookingOverlap,
  autoCompletePastConfirmedBookings,
  bookingDatesFromRow,
  confirmBookingRequest,
  formatBookingRowWithVip,
  formatBookingsWithVip,
  formatDateOnly,
  insertConfirmedBooking,
  parseOfferIncludes,
  validateAdminStayDates,
} from "../bookingHelpers";
import {
  blockedOverlapsExisting,
  buildDashboardOverview,
  formatBlockedDates,
} from "../dashboardHelpers";
import * as db from "../db";
import { statsFromBookings } from "../contactHelpers";
import { runDailyCheckInReminders } from "../reminderHelpers";

const bookingStatusSchema = z.enum(BOOKING_STATUSES);

const villaIdSchema = z.enum(VILLA_IDS);
const tierKeySchema = z.enum(TIER_KEYS);

const bookingInputSchema = z.object({
  villaId: villaIdSchema,
  checkInDate: z.string().date(),
  checkOutDate: z.string().date(),
  numberOfGuests: z.number().int().min(1).max(10),
  guestName: z.string().min(2).max(255),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: optionalPhoneSchema,
  guestNote: z.string().max(1000).optional(),
  adminNote: z.string().max(2000).optional(),
});

const contactInputSchema = z.object({
  fullName: z.string().min(2).max(255),
  phone: optionalPhoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(5000).optional(),
  isVip: z.boolean().optional(),
});

const paymentInputSchema = z.object({
  totalAmountEur: z.number().int().min(0),
  depositPaidEur: z.number().int().min(0),
});

function assertValidPayment(totalAmountEur: number, depositPaidEur: number) {
  if (depositPaidEur > totalAmountEur) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Капарото не може да надвишава общата сума",
    });
  }
}

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

        const token = await createAdminSessionToken(user);
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
            status: bookingStatusSchema.optional(),
            villaId: villaIdSchema.optional(),
            source: z.enum(["website", "manual"]).optional(),
            search: z.string().optional(),
            fromDate: z.string().date().optional(),
            toDate: z.string().date().optional(),
            offset: z.number().int().min(0).optional(),
            limit: z.number().int().min(1).max(100).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        await autoCompletePastConfirmedBookings();
        const filters = input ?? {};
        const limit = filters.limit ?? 50;
        const offset = filters.offset ?? 0;
        const { offset: _o, limit: _l, ...countFilters } = filters;
        const [rows, total] = await Promise.all([
          db.listBookings({ ...filters, limit, offset }),
          db.countBookings(countFilters),
        ]);
        return {
          items: await formatBookingsWithVip(rows),
          total,
          offset,
          limit,
          hasMore: offset + rows.length < total,
        };
      }),

    exportList: adminProcedure
      .input(
        z
          .object({
            status: bookingStatusSchema.optional(),
            villaId: villaIdSchema.optional(),
            source: z.enum(["website", "manual"]).optional(),
            search: z.string().optional(),
            fromDate: z.string().date().optional(),
            toDate: z.string().date().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        await autoCompletePastConfirmedBookings();
        const filters = input ?? {};
        const rows = await db.listBookings({ ...filters, limit: 10_000, offset: 0 });
        return formatBookingsWithVip(rows);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        await autoCompletePastConfirmedBookings();
        const row = await db.getBookingById(input.id);
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Резервацията не е намерена" });
        return (await formatBookingRowWithVip(row))!;
      }),

    calendar: adminProcedure
      .input(z.object({ fromDate: z.string().date(), toDate: z.string().date() }))
      .query(async ({ input }) => {
        await autoCompletePastConfirmedBookings();
        const [bookings, blocks] = await Promise.all([
          db.getCalendarBookings(input.fromDate, input.toDate),
          db.getBlockedDatesInRange(input.fromDate, input.toDate),
        ]);
        return {
          bookings: await formatBookingsWithVip(bookings),
          blocks: formatBlockedDates(blocks),
        };
      }),

    overview: adminProcedure.query(async () => {
      await autoCompletePastConfirmedBookings();
      const data = await buildDashboardOverview();
      return {
        today: data.today,
        tomorrow: data.tomorrow,
        weekEnd: data.weekEnd,
        pending: data.pending,
        checkInsToday: await formatBookingsWithVip(data.checkInsToday),
        checkInsTomorrow: await formatBookingsWithVip(data.checkInsTomorrow),
        checkOutsToday: await formatBookingsWithVip(data.checkOutsToday),
        checkOutsTomorrow: await formatBookingsWithVip(data.checkOutsTomorrow),
        emptyNightsByVilla: data.emptyNightsByVilla,
      };
    }),

    runDailyReminders: adminProcedure.mutation(async () => runDailyCheckInReminders()),

    stats: adminProcedure.query(async () => ({
      pending: await db.countPendingBookings(),
    })),

    create: adminProcedure
      .input(
        bookingInputSchema.extend({
          status: z.enum(["pending", "confirmed"]).default("confirmed"),
          totalAmountEur: z.number().int().min(0).optional(),
          depositPaidEur: z.number().int().min(0).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        validateAdminStayDates(input.checkInDate, input.checkOutDate);

        if (input.status === "confirmed") {
          if (input.totalAmountEur == null || input.depositPaidEur == null) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "При потвърдена резервация въведете обща сума и капаро",
            });
          }
          assertValidPayment(input.totalAmountEur, input.depositPaidEur);
        }

        const now = new Date();
        const bookingData = {
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
          totalAmountEur: input.status === "confirmed" ? input.totalAmountEur : null,
          depositPaidEur: input.status === "confirmed" ? input.depositPaidEur : 0,
          source: "manual" as const,
          createdByAdminId: ctx.user.id,
          processedAt: input.status !== "pending" ? now : null,
          processedByAdminId: input.status !== "pending" ? ctx.user.id : null,
        };

        const id =
          input.status === "confirmed"
            ? await insertConfirmedBooking(bookingData)
            : await db.insertBooking(bookingData);

        const booking = await db.getBookingById(id);
        if (booking) {
          const dates = bookingDatesFromRow(booking);
          await notifyManualBooking(
            {
              id: booking.id,
              guestName: booking.guestName,
              villaId: booking.villaId,
              checkInDate: dates.checkIn,
              checkOutDate: dates.checkOut,
              status: booking.status,
            },
            ctx.user.id,
            ctx.user.username
          );
        }

        const emailSent = input.status === "confirmed" ? await sendBookingConfirmationById(id) : false;

        await db.upsertContactFromGuest({
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          guestEmail: input.guestEmail,
        });

        return { id, success: true as const, emailSent };
      }),

    update: adminProcedure
      .input(
        bookingInputSchema.partial().extend({
          id: z.number().int().positive(),
          status: bookingStatusSchema.optional(),
          totalAmountEur: z.number().int().min(0).optional(),
          depositPaidEur: z.number().int().min(0).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getBookingById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

        const nextStatus = input.status ?? existing.status;
        const villaId = input.villaId ?? existing.villaId;
        const dates = bookingDatesFromRow({
          checkInDate: input.checkInDate ?? existing.checkInDate,
          checkOutDate: input.checkOutDate ?? existing.checkOutDate,
        });
        validateAdminStayDates(dates.checkIn, dates.checkOut);

        if (nextStatus === "confirmed") {
          await assertNoBookingOverlap(villaId, dates.checkIn, dates.checkOut, input.id);
        }

        const nextTotal =
          input.totalAmountEur !== undefined ? input.totalAmountEur : existing.totalAmountEur;
        const nextDeposit =
          input.depositPaidEur !== undefined ? input.depositPaidEur : existing.depositPaidEur ?? 0;

        const becameConfirmed = nextStatus === "confirmed" && existing.status !== "confirmed";
        if (becameConfirmed && nextTotal == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "При потвърждение въведете обща сума и капаро",
          });
        }
        if (nextTotal != null) {
          assertValidPayment(nextTotal, nextDeposit ?? 0);
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
          totalAmountEur: input.totalAmountEur,
          depositPaidEur: input.depositPaidEur,
          processedAt: statusChanged ? new Date() : existing.processedAt,
          processedByAdminId: statusChanged ? ctx.user.id : existing.processedByAdminId,
        });

        const emailSent = becameConfirmed ? await sendBookingConfirmationById(input.id) : false;

        await db.upsertContactFromGuest({
          guestName: input.guestName ?? existing.guestName,
          guestPhone: input.guestPhone !== undefined ? input.guestPhone : existing.guestPhone,
          guestEmail: input.guestEmail !== undefined ? input.guestEmail : existing.guestEmail,
        });

        return { success: true as const, emailSent };
      }),

    confirm: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          adminNote: z.string().max(2000).optional(),
          totalAmountEur: z.number().int().min(0),
          depositPaidEur: z.number().int().min(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        assertValidPayment(input.totalAmountEur, input.depositPaidEur);
        await confirmBookingRequest(input.id, ctx.user.id, {
          adminNote: input.adminNote,
          totalAmountEur: input.totalAmountEur,
          depositPaidEur: input.depositPaidEur,
        });
        const emailSent = await sendBookingConfirmationById(input.id);
        return { success: true as const, emailSent };
      }),

    sendConfirmationCard: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          imageBase64: z.string().min(100).max(6_000_000),
        })
      )
      .mutation(async ({ input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        if (booking.status !== "confirmed" && booking.status !== "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Картата е достъпна само за потвърдени резервации",
          });
        }
        if (booking.totalAmountEur == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Липсва обща сума — попълнете плащането",
          });
        }
        const imageJpeg = Buffer.from(input.imageBase64, "base64");
        const sent = await sendBookingConfirmationCardEmail(booking, imageJpeg);
        return { success: true as const, sent };
      }),

    updatePayment: adminProcedure
      .input(paymentInputSchema.extend({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        assertValidPayment(input.totalAmountEur, input.depositPaidEur);
        const existing = await db.getBookingById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing.status !== "confirmed" && existing.status !== "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Плащането се редактира само при потвърдени резервации",
          });
        }
        await db.updateBooking(input.id, {
          totalAmountEur: input.totalAmountEur,
          depositPaidEur: input.depositPaidEur,
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

  contacts: router({
    list: adminProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            offset: z.number().int().min(0).default(0),
            limit: z.number().int().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const filters = {
          search: input?.search,
          offset: input?.offset ?? 0,
          limit: input?.limit ?? 50,
        };
        const [items, total] = await Promise.all([
          db.listContacts(filters),
          db.countContacts(filters),
        ]);
        const enriched = await Promise.all(
          items.map(async contact => {
            const bookings = await db.listBookingsForContact(contact);
            return {
              id: contact.id,
              fullName: contact.fullName,
              phone: contact.phone,
              email: contact.email,
              notes: contact.notes,
              isVip: contact.isVip,
              updatedAt: contact.updatedAt,
              stats: statsFromBookings(bookings),
            };
          })
        );
        const offset = filters.offset;
        const limit = filters.limit;
        return {
          items: enriched,
          total,
          hasMore: offset + limit < total,
        };
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const contact = await db.getContactById(input.id);
        if (!contact) throw new TRPCError({ code: "NOT_FOUND" });
        const bookings = await db.listBookingsForContact(contact);
        return {
          contact: {
            id: contact.id,
            fullName: contact.fullName,
            phone: contact.phone,
            email: contact.email,
            notes: contact.notes,
            isVip: contact.isVip,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
          },
          stats: statsFromBookings(bookings),
          bookings: await formatBookingsWithVip(bookings),
        };
      }),

    create: adminProcedure.input(contactInputSchema).mutation(async ({ input }) => {
      const id = await db.insertContact({
        fullName: input.fullName,
        phone: input.phone || null,
        email: input.email || null,
        notes: input.notes ?? null,
        isVip: input.isVip ?? false,
      });
      return { id, success: true as const };
    }),

    update: adminProcedure
      .input(contactInputSchema.partial().extend({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const existing = await db.getContactById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateContact(input.id, {
          fullName: input.fullName,
          phone: input.phone !== undefined ? input.phone || null : undefined,
          email: input.email !== undefined ? input.email || null : undefined,
          notes: input.notes,
          isVip: input.isVip,
        });
        return { success: true as const };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const existing = await db.getContactById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await db.deleteContact(input.id);
        return { success: true as const };
      }),

    importFromBookings: adminProcedure.mutation(async () => {
      const created = await db.importContactsFromBookings();
      return { created, success: true as const };
    }),
  }),

  pricing: router({
    get: adminProcedure.query(async () => {
      const [rows, extras] = await Promise.all([db.getAllVillaPricing(), db.getPricingExtras()]);
      return { rows, extras };
    }),

    update: adminProcedure
      .input(
        z.object({
          rows: z.array(
            z.object({
              villaId: villaIdSchema,
              tierKey: tierKeySchema,
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

  blockedDates: router({
    list: adminProcedure
      .input(
        z
          .object({
            villaId: villaIdSchema.optional(),
            fromDate: z.string().date().optional(),
            toDate: z.string().date().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => formatBlockedDates(await db.listBlockedDates(input ?? {}))),

    create: adminProcedure
      .input(
        z.object({
          villaId: villaIdSchema,
          startDate: z.string().date(),
          endDate: z.string().date(),
          note: z.string().max(255).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        validateAdminStayDates(input.startDate, input.endDate);
        const [bookings, blocks] = await Promise.all([
          db.getConfirmedBookingsForVilla(input.villaId),
          db.getBlockedDatesForVilla(input.villaId),
        ]);
        if (blockedOverlapsExisting(input.villaId, input.startDate, input.endDate, bookings, blocks)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Периодът се припокрива с резервация или друго блокиране",
          });
        }
        const id = await db.insertBlockedDate({
          villaId: input.villaId,
          startDate: input.startDate,
          endDate: input.endDate,
          note: input.note?.trim() || null,
          createdByAdminId: ctx.user.id,
        });
        return { id };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const deleted = await db.deleteBlockedDate(input.id);
        if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Блокирането не е намерено" });
        return { success: true as const };
      }),
  }),

  offers: router({
    list: adminProcedure.query(async () => {
      const rows = await db.listOffers();
      return rows.map(o => ({
        ...o,
        includes: parseOfferIncludes(o.includesJson),
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
        try {
          const id = await db.insertOfferWithPublishCheck({
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
        } catch (err) {
          if (err instanceof db.PublishOfferLimitError) {
            throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
          }
          throw err;
        }
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
        try {
          await db.updateOfferWithPublishCheck(
            input.id,
            {
              slug: input.slug,
              title: input.title,
              priceEur: input.priceEur,
              oldPriceEur: input.oldPriceEur,
              period: input.period,
              description: input.description,
              includesJson: input.includes ? JSON.stringify(input.includes) : undefined,
              isPublished: input.isPublished,
              sortOrder: input.sortOrder,
            },
            existing.isPublished
          );
        } catch (err) {
          if (err instanceof db.PublishOfferLimitError) {
            throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
          }
          throw err;
        }
        return { success: true as const };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const deleted = await db.deleteOffer(input.id);
        if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Офертата не е намерена" });
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
      .mutation(async ({ input, ctx }) => {
        await db.deletePushSubscription(input.endpoint, ctx.user.id);
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
      includes: parseOfferIncludes(o.includesJson),
    }));
  }),
});

export const publicBookingRouter = router({
  getOccupiedDates: publicProcedure
    .input(z.object({ villaId: villaIdSchema.optional() }).optional())
    .query(async ({ input }) => {
      const [all, blocks] = await Promise.all([
        db.getAllConfirmedBookings(input?.villaId),
        db.getAllBlockedDates(input?.villaId),
      ]);
      return [
        ...all.map(b => {
          const dates = bookingDatesFromRow(b);
          return {
            villaId: b.villaId,
            checkInDate: dates.checkIn,
            checkOutDate: dates.checkOut,
          };
        }),
        ...blocks.map(b => ({
          villaId: b.villaId,
          checkInDate: formatDateOnly(b.startDate),
          checkOutDate: formatDateOnly(b.endDate),
        })),
      ];
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
        validateAdminStayDates(input.checkInDate, input.checkOutDate);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Невалидни дати",
        });
      }

      if (!input.guestEmail?.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Имейлът е задължителен" });
      }
      if (!input.guestPhone?.trim() || input.guestPhone.trim().length < 5) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Телефонът е задължителен" });
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
        const dates = bookingDatesFromRow(booking);
        await notifyNewWebsiteBooking({
          id: booking.id,
          guestName: booking.guestName,
          villaId: booking.villaId,
          checkInDate: dates.checkIn,
          checkOutDate: dates.checkOut,
        });
        await db.upsertContactFromGuest({
          guestName: booking.guestName,
          guestPhone: booking.guestPhone,
          guestEmail: booking.guestEmail,
        });
      }

      return { success: true, message: "Заявката е изпратена успешно", id };
    }),
});
