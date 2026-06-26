import { TRPCError } from "@trpc/server";
import { datesOverlap, validateStayDates } from "./bookingOverlap";
import * as db from "./db";

export async function assertNoBookingOverlap(
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: number
) {
  validateStayDates(checkIn, checkOut);
  const confirmed = await db.getConfirmedBookingsForVilla(villaId, excludeId);
  for (const booking of confirmed) {
    if (
      datesOverlap(
        checkIn,
        checkOut,
        String(booking.checkInDate),
        String(booking.checkOutDate)
      )
    ) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Периодът се припокрива с друга потвърдена резервация за тази вила",
      });
    }
  }
}

export function formatBookingRow(row: Awaited<ReturnType<typeof db.getBookingById>>) {
  if (!row) return null;
  return {
    ...row,
    checkInDate: String(row.checkInDate).slice(0, 10),
    checkOutDate: String(row.checkOutDate).slice(0, 10),
  };
}

export function formatBookings(rows: Awaited<ReturnType<typeof db.listBookings>>) {
  return rows.map(row => ({
    ...row,
    checkInDate: String(row.checkInDate).slice(0, 10),
    checkOutDate: String(row.checkOutDate).slice(0, 10),
  }));
}
