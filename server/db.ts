import { and, asc, desc, eq, gte, like, lte, ne, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminUsers,
  bookingRequests,
  offers,
  pricingExtras,
  pushSubscriptions,
  villaPricing,
  type AdminUser,
  type BookingRequest,
  type InsertAdminUser,
  type InsertBookingRequest,
  type InsertOffer,
  type InsertVillaPricing,
  type Offer,
  type VillaPricing,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y!, m! - 1, d);
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// --- Admin users ---

export async function countAdminUsers(): Promise<number> {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(adminUsers);
  return Number(rows[0]?.count ?? 0);
}

export async function createAdminUser(user: InsertAdminUser) {
  const db = await requireDb();
  const result = await db.insert(adminUsers).values(user);
  return result;
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return rows[0];
}

export async function getAdminUserById(id: number): Promise<AdminUser | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return rows[0];
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const db = await requireDb();
  return db.select().from(adminUsers).orderBy(asc(adminUsers.username));
}

export async function deleteAdminUser(id: number) {
  const db = await requireDb();
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function updateAdminPassword(id: number, passwordHash: string) {
  const db = await requireDb();
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id));
}

// --- Bookings ---

export type BookingListFilters = {
  status?: "pending" | "confirmed" | "rejected";
  villaId?: string;
  source?: "website" | "manual";
  search?: string;
  fromDate?: string;
  toDate?: string;
};

export async function insertBooking(
  data: Omit<InsertBookingRequest, "checkInDate" | "checkOutDate"> & {
    checkInDate: string | Date;
    checkOutDate: string | Date;
  }
): Promise<number> {
  const db = await requireDb();
  const result = await db.insert(bookingRequests).values({
    ...data,
    checkInDate: parseDateOnly(data.checkInDate),
    checkOutDate: parseDateOnly(data.checkOutDate),
  });
  return Number(result[0].insertId);
}

export async function getBookingById(id: number): Promise<BookingRequest | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id)).limit(1);
  return rows[0];
}

export async function listBookings(filters: BookingListFilters = {}, limit = 200): Promise<BookingRequest[]> {
  const db = await requireDb();
  const conditions = [];

  if (filters.status) conditions.push(eq(bookingRequests.status, filters.status));
  if (filters.villaId) conditions.push(eq(bookingRequests.villaId, filters.villaId));
  if (filters.source) conditions.push(eq(bookingRequests.source, filters.source));
  if (filters.fromDate) conditions.push(gte(bookingRequests.checkInDate, parseDateOnly(filters.fromDate)));
  if (filters.toDate) conditions.push(lte(bookingRequests.checkOutDate, parseDateOnly(filters.toDate)));
  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        like(bookingRequests.guestName, q),
        like(bookingRequests.guestPhone, q),
        like(bookingRequests.guestEmail, q)
      )!
    );
  }

  const query = db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt)).limit(limit);
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function updateBooking(
  id: number,
  data: Partial<
    Omit<InsertBookingRequest, "checkInDate" | "checkOutDate"> & {
      checkInDate?: string | Date;
      checkOutDate?: string | Date;
    }
  >
) {
  const db = await requireDb();
  const { checkInDate, checkOutDate, ...rest } = data;
  const patch: Partial<InsertBookingRequest> = { ...rest };
  if (checkInDate != null) patch.checkInDate = parseDateOnly(checkInDate);
  if (checkOutDate != null) patch.checkOutDate = parseDateOnly(checkOutDate);
  await db.update(bookingRequests).set(patch).where(eq(bookingRequests.id, id));
}

export async function getConfirmedBookingsForVilla(
  villaId: string,
  excludeId?: number
): Promise<BookingRequest[]> {
  const db = await requireDb();
  const conditions = [
    eq(bookingRequests.villaId, villaId),
    eq(bookingRequests.status, "confirmed"),
  ];
  if (excludeId != null) {
    conditions.push(ne(bookingRequests.id, excludeId));
  }
  return db.select().from(bookingRequests).where(and(...conditions));
}

export async function getCalendarBookings(fromDate: string, toDate: string): Promise<BookingRequest[]> {
  const db = await requireDb();
  return db
    .select()
    .from(bookingRequests)
    .where(
      and(
        lte(bookingRequests.checkInDate, parseDateOnly(toDate)),
        gte(bookingRequests.checkOutDate, parseDateOnly(fromDate))
      )
    )
    .orderBy(asc(bookingRequests.checkInDate));
}

export async function countPendingBookings(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingRequests)
    .where(eq(bookingRequests.status, "pending"));
  return Number(rows[0]?.count ?? 0);
}

// --- Pricing ---

export async function getAllVillaPricing(): Promise<VillaPricing[]> {
  const db = await requireDb();
  return db
    .select()
    .from(villaPricing)
    .orderBy(asc(villaPricing.villaId), asc(villaPricing.sortOrder));
}

export async function upsertVillaPricingRows(rows: InsertVillaPricing[]) {
  const db = await requireDb();
  for (const row of rows) {
    await db
      .insert(villaPricing)
      .values(row)
      .onDuplicateKeyUpdate({
        set: {
          tierLabel: row.tierLabel,
          winterPerNight: row.winterPerNight,
          summerPerNight: row.summerPerNight,
          sortOrder: row.sortOrder,
        },
      });
  }
}

export async function getPricingExtras() {
  const db = await requireDb();
  return db.select().from(pricingExtras).orderBy(asc(pricingExtras.key));
}

export async function upsertPricingExtra(key: string, label: string, amountEur: number) {
  const db = await requireDb();
  await db
    .insert(pricingExtras)
    .values({ key, label, amountEur })
    .onDuplicateKeyUpdate({ set: { label, amountEur } });
}

// --- Offers ---

export async function listOffers(): Promise<Offer[]> {
  const db = await requireDb();
  return db.select().from(offers).orderBy(asc(offers.sortOrder), desc(offers.createdAt));
}

export async function getPublishedOffers(): Promise<Offer[]> {
  const db = await requireDb();
  return db
    .select()
    .from(offers)
    .where(eq(offers.isPublished, true))
    .orderBy(asc(offers.sortOrder))
    .limit(2);
}

export async function getOfferById(id: number): Promise<Offer | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return rows[0];
}

export async function insertOffer(data: InsertOffer): Promise<number> {
  const db = await requireDb();
  const result = await db.insert(offers).values(data);
  return Number(result[0].insertId);
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  const db = await requireDb();
  await db.update(offers).set(data).where(eq(offers.id, id));
}

export async function deleteOffer(id: number) {
  const db = await requireDb();
  await db.delete(offers).where(eq(offers.id, id));
}

export async function countPublishedOffers(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.isPublished, true));
  return Number(rows[0]?.count ?? 0);
}

// --- Push subscriptions ---

export async function upsertPushSubscription(data: {
  adminUserId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  const db = await requireDb();
  await db
    .insert(pushSubscriptions)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        adminUserId: data.adminUserId,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent ?? null,
      },
    });
}

export async function deletePushSubscription(endpoint: string) {
  const db = await requireDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function getPushSubscriptions(excludeAdminUserId?: number) {
  const db = await requireDb();
  if (excludeAdminUserId != null) {
    return db
      .select()
      .from(pushSubscriptions)
      .where(ne(pushSubscriptions.adminUserId, excludeAdminUserId));
  }
  return db.select().from(pushSubscriptions);
}

export async function deletePushSubscriptionById(id: number) {
  const db = await requireDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
}
