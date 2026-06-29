import { VILLA_IDS } from "@shared/villas";
import { datesOverlap } from "./bookingOverlap";
import { formatDateOnly } from "./bookingHelpers";
import * as db from "./db";

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d! + days));
  return formatDateOnly(date);
}

function nightsBetween(fromDate: string, toDate: string): string[] {
  const nights: string[] = [];
  let cur = fromDate;
  while (cur < toDate) {
    nights.push(cur);
    cur = addDaysStr(cur, 1);
  }
  return nights;
}

function isNightOccupied(
  villaId: string,
  night: string,
  bookings: Awaited<ReturnType<typeof db.getActiveConfirmedInRange>>,
  blocks: Awaited<ReturnType<typeof db.getBlockedDatesInRange>>
): boolean {
  for (const booking of bookings) {
    if (booking.villaId !== villaId) continue;
    const checkIn = formatDateOnly(booking.checkInDate);
    const checkOut = formatDateOnly(booking.checkOutDate);
    if (night >= checkIn && night < checkOut) return true;
  }
  for (const block of blocks) {
    if (block.villaId !== villaId) continue;
    const start = formatDateOnly(block.startDate);
    const end = formatDateOnly(block.endDate);
    if (night >= start && night < end) return true;
  }
  return false;
}

export function countEmptyNightsByVilla(
  fromDate: string,
  toDate: string,
  bookings: Awaited<ReturnType<typeof db.getActiveConfirmedInRange>>,
  blocks: Awaited<ReturnType<typeof db.getBlockedDatesInRange>>
): Record<(typeof VILLA_IDS)[number], number> {
  const nights = nightsBetween(fromDate, toDate);
  const result = {} as Record<(typeof VILLA_IDS)[number], number>;
  for (const villaId of VILLA_IDS) {
    result[villaId] = nights.filter(night => !isNightOccupied(villaId, night, bookings, blocks)).length;
  }
  return result;
}

export function formatBlockedDateRow(row: Awaited<ReturnType<typeof db.getBlockedDateById>>) {
  if (!row) return null;
  return {
    ...row,
    startDate: formatDateOnly(row.startDate),
    endDate: formatDateOnly(row.endDate),
  };
}

export function formatBlockedDates(rows: Awaited<ReturnType<typeof db.listBlockedDates>>) {
  return rows.map(row => ({
    ...row,
    startDate: formatDateOnly(row.startDate),
    endDate: formatDateOnly(row.endDate),
  }));
}

export function blockedOverlapsExisting(
  villaId: string,
  startDate: string,
  endDate: string,
  bookings: Awaited<ReturnType<typeof db.getConfirmedBookingsForVilla>>,
  blocks: Awaited<ReturnType<typeof db.getBlockedDatesForVilla>>
): boolean {
  for (const booking of bookings) {
    if (
      datesOverlap(
        startDate,
        endDate,
        formatDateOnly(booking.checkInDate),
        formatDateOnly(booking.checkOutDate)
      )
    ) {
      return true;
    }
  }
  for (const block of blocks) {
    if (
      datesOverlap(
        startDate,
        endDate,
        formatDateOnly(block.startDate),
        formatDateOnly(block.endDate)
      )
    ) {
      return true;
    }
  }
  return false;
}

export async function buildDashboardOverview() {
  const today = formatDateOnly(new Date());
  const tomorrow = addDaysStr(today, 1);
  const weekEnd = addDaysStr(today, 7);

  const [
    pending,
    checkInsToday,
    checkInsTomorrow,
    checkOutsToday,
    checkOutsTomorrow,
    weekBookings,
    weekBlocks,
  ] = await Promise.all([
    db.countPendingBookings(),
    db.getConfirmedCheckInsOn(today),
    db.getConfirmedCheckInsOn(tomorrow),
    db.getConfirmedCheckOutsOn(today),
    db.getConfirmedCheckOutsOn(tomorrow),
    db.getActiveConfirmedInRange(today, weekEnd),
    db.getBlockedDatesInRange(today, weekEnd),
  ]);

  return {
    today,
    tomorrow,
    weekEnd,
    pending,
    checkInsToday,
    checkInsTomorrow,
    checkOutsToday,
    checkOutsTomorrow,
    emptyNightsByVilla: countEmptyNightsByVilla(today, weekEnd, weekBookings, weekBlocks),
  };
}
