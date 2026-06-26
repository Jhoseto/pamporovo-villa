import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { adminRouter, publicBookingRouter, publicContentRouter } from "./routers/admin";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  content: publicContentRouter,
  booking: publicBookingRouter,
});

export type AppRouter = typeof appRouter;
