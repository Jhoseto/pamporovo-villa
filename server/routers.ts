import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createBookingRequest, createInquiry } from "./db";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Booking procedures
  booking: router({
    createRequest: publicProcedure
      .input(
        z.object({
          checkInDate: z.string().date(),
          checkOutDate: z.string().date(),
          numberOfGuests: z.number().int().min(1).max(10),
          guestName: z.string().min(2).max(255),
          guestEmail: z.string().email(),
          guestPhone: z.string().min(5).max(20),
          specialRequests: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Validate dates
          const checkIn = new Date(input.checkInDate);
          const checkOut = new Date(input.checkOutDate);
          
          if (checkOut <= checkIn) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Check-out date must be after check-in date",
            });
          }

          await createBookingRequest({
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: input.numberOfGuests,
            guestName: input.guestName,
            guestEmail: input.guestEmail,
            guestPhone: input.guestPhone,
            specialRequests: input.specialRequests || null,
            status: "pending",
          });

          await notifyOwner({
            title: "🏠 Ново резервационно запитване",
            content: `Гост ${input.guestName} е направил резервационно запитване за периода ${input.checkInDate} до ${input.checkOutDate} (${input.numberOfGuests} гости).\n\nEmail: ${input.guestEmail}\nТелефон: ${input.guestPhone}`,
          }).catch(error => {
            console.warn("[Booking] Owner notification failed:", error);
          });

          return {
            success: true,
            message: "Booking request submitted successfully",
          };
        } catch (error) {
          console.error("Booking creation error:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create booking request",
          });
        }
      }),
  }),

  // Inquiry procedures
  inquiry: router({
    submit: publicProcedure
      .input(
        z.object({
          visitorName: z.string().min(2).max(255),
          visitorEmail: z.string().email(),
          visitorPhone: z.string().min(5).max(20).optional(),
          subject: z.string().min(5).max(255),
          message: z.string().min(10).max(5000),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createInquiry({
            visitorName: input.visitorName,
            visitorEmail: input.visitorEmail,
            visitorPhone: input.visitorPhone || null,
            subject: input.subject,
            message: input.message,
            status: "new",
          });

          await notifyOwner({
            title: "💬 Ново запитване от посетител",
            content: `${input.visitorName} е изпратил запитване със субект: "${input.subject}"\n\nEmail: ${input.visitorEmail}\nТелефон: ${input.visitorPhone || "Не е посочен"}\n\nСъобщение: ${input.message}`,
          }).catch(error => {
            console.warn("[Inquiry] Owner notification failed:", error);
          });

          return {
            success: true,
            message: "Inquiry submitted successfully",
          };
        } catch (error) {
          console.error("Inquiry creation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit inquiry",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
