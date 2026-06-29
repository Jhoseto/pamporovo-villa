import { TRPCError } from "@trpc/server";
import { and, eq, lt, ne, sql } from "drizzle-orm";
import { bookingRequests } from "../drizzle/schema";
import { datesOverlap, validateStayDates } from "./bookingOverlap";
import * as db from "./db";
import { guestPhoneNormalized, isGuestVip, type VipLookup } from "./contactHelpers";

/** MySQL DATE → yyyy-MM-dd (UTC). */
export function formatDateOnly(value: string | Date | null | undefined): string {
  if (value == null) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function validateAdminStayDates(checkIn: string, checkOut: string): void {
  try {
    validateStayDates(checkIn, checkOut);
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error instanceof Error ? error.message : "Невалидни дати",
    });
  }
}

export function bookingDatesFromRow(row: {
  checkInDate: string | Date;
  checkOutDate: string | Date;
}) {
  return {
    checkIn: formatDateOnly(row.checkInDate),
    checkOut: formatDateOnly(row.checkOutDate),
  };
}

type OverlapTx = {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
  select: () => {
    from: (table: typeof bookingRequests) => {
      where: (condition: ReturnType<typeof and>) => Promise<(typeof bookingRequests.$inferSelect)[]>;
    };
  };
  update: (table: typeof bookingRequests) => {
    set: (values: Record<string, unknown>) => {
      where: (condition: ReturnType<typeof eq>) => Promise<unknown>;
    };
  };
  insert: (table: typeof bookingRequests) => {
    values: (values: Record<string, unknown>) => Promise<{ insertId: number }[]>;
  };
};

async function checkOverlapInTx(
  tx: OverlapTx,
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: number
) {
  validateAdminStayDates(checkIn, checkOut);
  await tx.execute(
    sql`SELECT id FROM booking_requests WHERE villa_id = ${villaId} AND status = 'confirmed' FOR UPDATE`
  );
  const conditions = [eq(bookingRequests.villaId, villaId), eq(bookingRequests.status, "confirmed")];
  if (excludeId != null) {
    conditions.push(ne(bookingRequests.id, excludeId));
  }
  const confirmed = await tx.select().from(bookingRequests).where(and(...conditions));
  for (const booking of confirmed) {
    if (
      datesOverlap(
        checkIn,
        checkOut,
        formatDateOnly(booking.checkInDate),
        formatDateOnly(booking.checkOutDate)
      )
    ) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Периодът се припокрива с друга потвърдена резервация за тази вила",
      });
    }
  }

  const blocks = await db.getBlockedDatesForVilla(villaId);
  for (const block of blocks) {
    if (
      datesOverlap(
        checkIn,
        checkOut,
        formatDateOnly(block.startDate),
        formatDateOnly(block.endDate)
      )
    ) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Периодът се припокрива с блокирани дати за тази вила",
      });
    }
  }
}

export async function assertNoBookingOverlap(
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: number
) {
  const database = await db.requireDb();
  await database.transaction(async tx => {
    await checkOverlapInTx(tx as unknown as OverlapTx, villaId, checkIn, checkOut, excludeId);
  });
}

export async function confirmBookingRequest(
  id: number,
  adminUserId: number,
  options?: {
    adminNote?: string | null;
    totalAmountEur?: number;
    depositPaidEur?: number;
  }
): Promise<void> {
  const database = await db.requireDb();
  await database.transaction(async tx => {
    const overlapTx = tx as unknown as OverlapTx;
    const rows = await overlapTx.select().from(bookingRequests).where(eq(bookingRequests.id, id));
    const existing = rows[0];
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Резервацията не е намерена" });
    }
    const { checkIn, checkOut } = bookingDatesFromRow(existing);
    await checkOverlapInTx(overlapTx, existing.villaId, checkIn, checkOut, id);
    await overlapTx
      .update(bookingRequests)
      .set({
        status: "confirmed",
        adminNote: options?.adminNote ?? existing.adminNote,
        totalAmountEur: options?.totalAmountEur ?? existing.totalAmountEur,
        depositPaidEur: options?.depositPaidEur ?? existing.depositPaidEur ?? 0,
        processedAt: new Date(),
        processedByAdminId: adminUserId,
      })
      .where(eq(bookingRequests.id, id));
  });
}

export async function insertConfirmedBooking(
  data: Parameters<typeof db.insertBooking>[0]
): Promise<number> {
  const database = await db.requireDb();
  return database.transaction(async tx => {
    const overlapTx = tx as unknown as OverlapTx;
    await checkOverlapInTx(
      overlapTx,
      data.villaId,
      formatDateOnly(data.checkInDate),
      formatDateOnly(data.checkOutDate)
    );
    const result = await overlapTx.insert(bookingRequests).values({
      ...data,
      guestPhoneNormalized: guestPhoneNormalized(data.guestPhone),
      checkInDate: db.parseDateOnlyForDb(data.checkInDate),
      checkOutDate: db.parseDateOnlyForDb(data.checkOutDate),
    });
    return Number(result[0]?.insertId);
  });
}

export function parseOfferIncludes(includesJson: string): string[] {
  try {
    const parsed = JSON.parse(includesJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function normalizeAdminTags(_tags?: string[] | null): string[] {
  return [];
}

export function parseAdminTags(_json: string | null | undefined): string[] {
  return [];
}

export function serializeAdminTags(_tags?: string[] | null): string {
  return "[]";
}

/** Confirmed stays with checkout before today → completed (Гостували). */
export async function autoCompletePastConfirmedBookings(): Promise<number> {
  const database = await db.requireDb();
  const today = formatDateOnly(new Date());
  const result = await database
    .update(bookingRequests)
    .set({ status: "completed" })
    .where(
      and(
        eq(bookingRequests.status, "confirmed"),
        lt(bookingRequests.checkOutDate, db.parseDateOnlyForDb(today))
      )
    );
  return Number(result[0]?.affectedRows ?? 0);
}

function formatBookingBase(row: NonNullable<Awaited<ReturnType<typeof db.getBookingById>>>) {
  return {
    ...row,
    checkInDate: formatDateOnly(row.checkInDate),
    checkOutDate: formatDateOnly(row.checkOutDate),
  };
}

function withGuestVip<T extends { guestPhoneNormalized?: string | null; guestEmail?: string | null }>(
  row: T,
  lookup: VipLookup
) {
  return {
    ...row,
    guestIsVip: isGuestVip(row.guestPhoneNormalized, row.guestEmail, lookup),
  };
}

export function formatBookingRow(
  row: Awaited<ReturnType<typeof db.getBookingById>>,
  lookup?: VipLookup
) {
  if (!row) return null;
  const formatted = formatBookingBase(row);
  return lookup ? withGuestVip(formatted, lookup) : { ...formatted, guestIsVip: false };
}

export function formatBookings(
  rows: Awaited<ReturnType<typeof db.listBookings>>,
  lookup?: VipLookup
) {
  return rows.map(row => {
    const formatted = formatBookingBase(row);
    return lookup ? withGuestVip(formatted, lookup) : { ...formatted, guestIsVip: false };
  });
}

export async function formatBookingsWithVip(rows: Awaited<ReturnType<typeof db.listBookings>>) {
  const lookup = await db.getVipContactLookup();
  return formatBookings(rows, lookup);
}

export async function formatBookingRowWithVip(row: Awaited<ReturnType<typeof db.getBookingById>>) {
  if (!row) return null;
  const lookup = await db.getVipContactLookup();
  return formatBookingRow(row, lookup);
}
