import { and, asc, desc, eq, gt, gte, like, lte, ne, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminUsers,
  adminReminderLog,
  blockedDates,
  bookingRequests,
  clientContacts,
  customerReviews,
  offers,
  pricingExtras,
  pushSubscriptions,
  villaPricing,
  type AdminUser,
  type BlockedDate,
  type BookingRequest,
  type ClientContact,
  type CustomerReview,
  type InsertAdminUser,
  type InsertBlockedDate,
  type InsertBookingRequest,
  type InsertClientContact,
  type InsertCustomerReview,
  type InsertOffer,
  type InsertVillaPricing,
  type Offer,
  type VillaPricing,
} from "../drizzle/schema";
import { contactFieldsFromGuest, guestPhoneNormalized, buildVipLookup } from "./contactHelpers";
import { normalizeEmail, phoneSearchPatterns, storedPhoneDigits } from "@shared/phoneNormalize";

let _db: ReturnType<typeof drizzle> | null = null;

function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d));
}

export function parseDateOnlyForDb(value: string | Date): Date {
  return parseDateOnly(value);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
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
  await deletePushSubscriptionsForAdmin(id);
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function updateAdminPassword(id: number, passwordHash: string) {
  const db = await requireDb();
  const user = await getAdminUserById(id);
  if (!user) return;
  await db
    .update(adminUsers)
    .set({ passwordHash, tokenVersion: (user.tokenVersion ?? 0) + 1 })
    .where(eq(adminUsers.id, id));
}

export async function updateAdminNotificationSound(
  id: number,
  data: { notificationSoundToken: string | null; notificationSoundExt: string | null }
) {
  const db = await requireDb();
  await db
    .update(adminUsers)
    .set({
      notificationSoundToken: data.notificationSoundToken,
      notificationSoundExt: data.notificationSoundExt,
    })
    .where(eq(adminUsers.id, id));
}

// --- Bookings ---

export type BookingListFilters = {
  status?: "pending" | "confirmed" | "completed" | "rejected";
  villaId?: string;
  source?: "website" | "manual";
  search?: string;
  fromDate?: string;
  toDate?: string;
  offset?: number;
  limit?: number;
};

function buildBookingConditions(filters: BookingListFilters) {
  const conditions = [];

  if (filters.status) conditions.push(eq(bookingRequests.status, filters.status));
  if (filters.villaId) conditions.push(eq(bookingRequests.villaId, filters.villaId));
  if (filters.source) conditions.push(eq(bookingRequests.source, filters.source));
  if (filters.fromDate) conditions.push(gte(bookingRequests.checkInDate, parseDateOnly(filters.fromDate)));
  if (filters.toDate) conditions.push(lte(bookingRequests.checkOutDate, parseDateOnly(filters.toDate)));
  if (filters.search?.trim()) {
    const q = `%${escapeLikePattern(filters.search.trim())}%`;
    conditions.push(
      or(
        like(bookingRequests.guestName, q),
        like(bookingRequests.guestPhone, q),
        like(bookingRequests.guestEmail, q)
      )!
    );
  }
  return conditions;
}

export async function countBookings(filters: Omit<BookingListFilters, "offset" | "limit"> = {}): Promise<number> {
  const db = await requireDb();
  const conditions = buildBookingConditions(filters);
  const query = db.select({ count: sql<number>`count(*)` }).from(bookingRequests);
  const rows =
    conditions.length > 0 ? await query.where(and(...conditions)) : await query;
  return Number(rows[0]?.count ?? 0);
}

export async function listBookings(filters: BookingListFilters = {}): Promise<BookingRequest[]> {
  const db = await requireDb();
  const conditions = buildBookingConditions(filters);
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const query = db
    .select()
    .from(bookingRequests)
    .orderBy(desc(bookingRequests.createdAt))
    .limit(limit)
    .offset(offset);
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function insertBooking(
  data: Omit<InsertBookingRequest, "checkInDate" | "checkOutDate"> & {
    checkInDate: string | Date;
    checkOutDate: string | Date;
  }
): Promise<number> {
  const db = await requireDb();
  const guestPhone = storedPhoneDigits(data.guestPhone);
  const result = await db.insert(bookingRequests).values({
    ...data,
    guestPhone,
    guestPhoneNormalized: guestPhoneNormalized(guestPhone),
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
  const { checkInDate, checkOutDate, guestPhone, ...rest } = data;
  const patch: Partial<InsertBookingRequest> = { ...rest };
  if (checkInDate != null) patch.checkInDate = parseDateOnly(checkInDate);
  if (checkOutDate != null) patch.checkOutDate = parseDateOnly(checkOutDate);
  if (guestPhone !== undefined) {
    patch.guestPhone = storedPhoneDigits(guestPhone);
    patch.guestPhoneNormalized = guestPhoneNormalized(patch.guestPhone);
  }
  await db.update(bookingRequests).set(patch).where(eq(bookingRequests.id, id));
}

export async function deleteBooking(id: number): Promise<boolean> {
  const db = await requireDb();
  const result = await db.delete(bookingRequests).where(eq(bookingRequests.id, id));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function getAllConfirmedBookings(villaId?: string): Promise<BookingRequest[]> {
  const db = await requireDb();
  const conditions = [eq(bookingRequests.status, "confirmed")];
  if (villaId) conditions.push(eq(bookingRequests.villaId, villaId));
  return db
    .select()
    .from(bookingRequests)
    .where(and(...conditions))
    .orderBy(asc(bookingRequests.checkInDate));
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
        gt(bookingRequests.checkOutDate, parseDateOnly(fromDate))
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

export async function getConfirmedCheckInsOn(date: string): Promise<BookingRequest[]> {
  const db = await requireDb();
  return db
    .select()
    .from(bookingRequests)
    .where(and(eq(bookingRequests.status, "confirmed"), eq(bookingRequests.checkInDate, parseDateOnly(date))))
    .orderBy(asc(bookingRequests.villaId));
}

export async function getConfirmedCheckOutsOn(date: string): Promise<BookingRequest[]> {
  const db = await requireDb();
  return db
    .select()
    .from(bookingRequests)
    .where(and(eq(bookingRequests.status, "confirmed"), eq(bookingRequests.checkOutDate, parseDateOnly(date))))
    .orderBy(asc(bookingRequests.villaId));
}

export async function getActiveConfirmedInRange(fromDate: string, toDate: string): Promise<BookingRequest[]> {
  const db = await requireDb();
  return db
    .select()
    .from(bookingRequests)
    .where(
      and(
        eq(bookingRequests.status, "confirmed"),
        lte(bookingRequests.checkInDate, parseDateOnly(toDate)),
        gt(bookingRequests.checkOutDate, parseDateOnly(fromDate))
      )
    );
}

// --- Blocked dates ---

export async function listBlockedDates(filters?: {
  villaId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<BlockedDate[]> {
  const db = await requireDb();
  const conditions = [];
  if (filters?.villaId) conditions.push(eq(blockedDates.villaId, filters.villaId));
  if (filters?.fromDate) {
    conditions.push(gte(blockedDates.endDate, parseDateOnly(filters.fromDate)));
  }
  if (filters?.toDate) {
    conditions.push(lte(blockedDates.startDate, parseDateOnly(filters.toDate)));
  }
  const query = db.select().from(blockedDates).orderBy(asc(blockedDates.startDate));
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function getBlockedDateById(id: number): Promise<BlockedDate | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(blockedDates).where(eq(blockedDates.id, id)).limit(1);
  return rows[0];
}

export async function getBlockedDatesForVilla(
  villaId: string,
  excludeId?: number
): Promise<BlockedDate[]> {
  const db = await requireDb();
  const conditions = [eq(blockedDates.villaId, villaId)];
  if (excludeId != null) {
    conditions.push(ne(blockedDates.id, excludeId));
  }
  return db.select().from(blockedDates).where(and(...conditions));
}

export async function getBlockedDatesInRange(fromDate: string, toDate: string): Promise<BlockedDate[]> {
  const db = await requireDb();
  return db
    .select()
    .from(blockedDates)
    .where(
      and(
        lte(blockedDates.startDate, parseDateOnly(toDate)),
        gt(blockedDates.endDate, parseDateOnly(fromDate))
      )
    )
    .orderBy(asc(blockedDates.startDate));
}

export async function getAllBlockedDates(villaId?: string): Promise<BlockedDate[]> {
  const db = await requireDb();
  if (villaId) {
    return db
      .select()
      .from(blockedDates)
      .where(eq(blockedDates.villaId, villaId))
      .orderBy(asc(blockedDates.startDate));
  }
  return db.select().from(blockedDates).orderBy(asc(blockedDates.startDate));
}

export async function insertBlockedDate(
  data: Omit<InsertBlockedDate, "startDate" | "endDate"> & {
    startDate: string | Date;
    endDate: string | Date;
  }
): Promise<number> {
  const db = await requireDb();
  const result = await db.insert(blockedDates).values({
    ...data,
    startDate: parseDateOnly(data.startDate),
    endDate: parseDateOnly(data.endDate),
  });
  return Number(result[0].insertId);
}

export async function deleteBlockedDate(id: number): Promise<boolean> {
  const db = await requireDb();
  const result = await db.delete(blockedDates).where(eq(blockedDates.id, id));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function hasReminderBeenSent(reminderKey: string): Promise<boolean> {
  const db = await requireDb();
  const rows = await db
    .select({ id: adminReminderLog.id })
    .from(adminReminderLog)
    .where(eq(adminReminderLog.reminderKey, reminderKey))
    .limit(1);
  return rows.length > 0;
}

export async function markReminderSent(reminderKey: string): Promise<void> {
  const db = await requireDb();
  await db.insert(adminReminderLog).values({ reminderKey }).onDuplicateKeyUpdate({
    set: { sentAt: new Date() },
  });
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

export async function deleteOffer(id: number): Promise<boolean> {
  const db = await requireDb();
  const result = await db.delete(offers).where(eq(offers.id, id));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function countPublishedOffers(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.isPublished, true));
  return Number(rows[0]?.count ?? 0);
}

export class PublishOfferLimitError extends Error {
  constructor() {
    super("Максимум 2 публикувани оферти");
    this.name = "PublishOfferLimitError";
  }
}

type OfferTx = {
  select: Awaited<ReturnType<typeof requireDb>>["select"];
  insert: Awaited<ReturnType<typeof requireDb>>["insert"];
  update: Awaited<ReturnType<typeof requireDb>>["update"];
};

async function countPublishedOffersInTx(tx: OfferTx): Promise<number> {
  const rows = await tx
    .select()
    .from(offers)
    .where(eq(offers.isPublished, true))
    .for("update");
  return rows.length;
}

export async function insertOfferWithPublishCheck(data: InsertOffer): Promise<number> {
  const database = await requireDb();
  return database.transaction(async tx => {
    const offerTx = tx as unknown as OfferTx;
    if (data.isPublished) {
      const count = await countPublishedOffersInTx(offerTx);
      if (count >= 2) throw new PublishOfferLimitError();
    }
    const result = await offerTx.insert(offers).values(data);
    return Number(result[0].insertId);
  });
}

export async function updateOfferWithPublishCheck(
  id: number,
  data: Partial<InsertOffer>,
  wasPublished: boolean
): Promise<void> {
  const database = await requireDb();
  await database.transaction(async tx => {
    const offerTx = tx as unknown as OfferTx;
    if (data.isPublished === true && !wasPublished) {
      const count = await countPublishedOffersInTx(offerTx);
      if (count >= 2) throw new PublishOfferLimitError();
    }
    await offerTx.update(offers).set(data).where(eq(offers.id, id));
  });
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

export async function deletePushSubscription(endpoint: string, adminUserId?: number) {
  const db = await requireDb();
  const conditions = [eq(pushSubscriptions.endpoint, endpoint)];
  if (adminUserId != null) {
    conditions.push(eq(pushSubscriptions.adminUserId, adminUserId));
  }
  await db.delete(pushSubscriptions).where(and(...conditions));
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

export async function deletePushSubscriptionsForAdmin(adminUserId: number) {
  const db = await requireDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.adminUserId, adminUserId));
}

// --- Client contacts ---

export type ContactListFilters = {
  search?: string;
  offset?: number;
  limit?: number;
};

function buildContactSearchCondition(search: string) {
  const trimmed = search.trim();
  if (!trimmed) return null;

  const parts = [];
  const namePattern = `%${escapeLikePattern(trimmed).toLowerCase()}%`;
  parts.push(sql`LOWER(${clientContacts.fullName}) LIKE ${namePattern}`);

  const digitPatterns = phoneSearchPatterns(trimmed);
  for (const pattern of digitPatterns) {
    parts.push(like(clientContacts.phoneNormalized, `%${escapeLikePattern(pattern)}%`));
  }

  return or(...parts)!;
}

export async function countContacts(filters: Omit<ContactListFilters, "offset" | "limit"> = {}): Promise<number> {
  const db = await requireDb();
  const conditions = [];
  if (filters.search?.trim()) {
    const searchCond = buildContactSearchCondition(filters.search);
    if (searchCond) conditions.push(searchCond);
  }
  const query = db.select({ count: sql<number>`count(*)` }).from(clientContacts);
  const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;
  return Number(rows[0]?.count ?? 0);
}

export async function listContacts(filters: ContactListFilters = {}): Promise<ClientContact[]> {
  const db = await requireDb();
  const conditions = [];
  if (filters.search?.trim()) {
    const searchCond = buildContactSearchCondition(filters.search);
    if (searchCond) conditions.push(searchCond);
  }
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const query = db
    .select()
    .from(clientContacts)
    .orderBy(desc(clientContacts.updatedAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getContactById(id: number): Promise<ClientContact | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(clientContacts).where(eq(clientContacts.id, id)).limit(1);
  return rows[0];
}

async function findContactByPhoneOrEmail(
  phoneNormalized: string | null,
  email: string | null
): Promise<ClientContact | undefined> {
  const db = await requireDb();
  const conditions = [];
  if (phoneNormalized) conditions.push(eq(clientContacts.phoneNormalized, phoneNormalized));
  if (email) conditions.push(sql`LOWER(${clientContacts.email}) = ${email}`);
  if (conditions.length === 0) return undefined;

  const rows = await db
    .select()
    .from(clientContacts)
    .where(or(...conditions)!)
    .limit(1);
  return rows[0];
}

export async function getVipContactLookup() {
  const db = await requireDb();
  const rows = await db
    .select({
      phoneNormalized: clientContacts.phoneNormalized,
      email: clientContacts.email,
    })
    .from(clientContacts)
    .where(eq(clientContacts.isVip, true));
  return buildVipLookup(rows);
}

export async function insertContact(
  data: Omit<InsertClientContact, "phoneNormalized" | "isVip"> & {
    phone?: string | null;
    email?: string | null;
    isVip?: boolean;
  }
): Promise<number> {
  const db = await requireDb();
  const fields = contactFieldsFromGuest({
    guestName: data.fullName,
    guestPhone: data.phone,
    guestEmail: data.email,
  });
  const result = await db.insert(clientContacts).values({
    fullName: fields.fullName,
    phone: fields.phone,
    phoneNormalized: fields.phoneNormalized,
    email: fields.email,
    notes: data.notes ?? null,
    isVip: data.isVip ?? false,
  });
  return Number(result[0].insertId);
}

export async function updateContact(
  id: number,
  data: Partial<{
    fullName: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    isVip: boolean;
  }>
) {
  const db = await requireDb();
  const existing = await getContactById(id);
  if (!existing) return;

  const fullName = data.fullName?.trim() ?? existing.fullName;
  const phone = data.phone !== undefined ? data.phone?.trim() || null : existing.phone;
  const email = data.email !== undefined ? data.email : existing.email;
  const fields = contactFieldsFromGuest({
    guestName: fullName,
    guestPhone: phone,
    guestEmail: email,
  });

  await db
    .update(clientContacts)
    .set({
      fullName: fields.fullName,
      phone: fields.phone,
      phoneNormalized: fields.phoneNormalized,
      email: fields.email,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      isVip: data.isVip !== undefined ? data.isVip : existing.isVip,
    })
    .where(eq(clientContacts.id, id));
}

export async function deleteContact(id: number) {
  const db = await requireDb();
  await db.delete(clientContacts).where(eq(clientContacts.id, id));
}

export async function listBookingsForContact(contact: ClientContact): Promise<BookingRequest[]> {
  const db = await requireDb();
  const conditions = [];

  if (contact.phoneNormalized) {
    conditions.push(eq(bookingRequests.guestPhoneNormalized, contact.phoneNormalized));
  }
  const email = normalizeEmail(contact.email);
  if (email) {
    conditions.push(sql`LOWER(${bookingRequests.guestEmail}) = ${email}`);
  }

  if (conditions.length === 0) return [];

  return db
    .select()
    .from(bookingRequests)
    .where(or(...conditions)!)
    .orderBy(desc(bookingRequests.checkInDate));
}

export async function upsertContactFromGuest(input: {
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
}): Promise<number | null> {
  const fields = contactFieldsFromGuest(input);
  if (!fields.phoneNormalized && !fields.email) return null;

  const existing = await findContactByPhoneOrEmail(fields.phoneNormalized, fields.email);
  if (existing) {
    await updateContact(existing.id, {
      fullName: fields.fullName,
      phone: fields.phone ?? existing.phone,
      email: fields.email ?? existing.email ?? null,
    });
    return existing.id;
  }

  return insertContact({
    fullName: fields.fullName,
    phone: fields.phone,
    email: fields.email,
    notes: null,
  });
}

export async function importContactsFromBookings(): Promise<number> {
  const db = await requireDb();
  const bookings = await db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt));
  const groups = new Map<string, { guestName: string; guestPhone: string | null; guestEmail: string | null }>();

  for (const booking of bookings) {
    const phoneNorm = guestPhoneNormalized(booking.guestPhone);
    const email = normalizeEmail(booking.guestEmail);
    const key = phoneNorm ? `p:${phoneNorm}` : email ? `e:${email}` : null;
    if (!key || groups.has(key)) continue;
    groups.set(key, {
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestEmail: booking.guestEmail,
    });
  }

  let created = 0;
  for (const guest of Array.from(groups.values())) {
    const fields = contactFieldsFromGuest(guest);
    const existing = await findContactByPhoneOrEmail(fields.phoneNormalized, fields.email);
    if (existing) continue;
    await insertContact({
      fullName: fields.fullName,
      phone: fields.phone,
      email: fields.email,
      notes: null,
    });
    created++;
  }
  return created;
}

export async function backfillGuestPhoneNormalized(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ id: bookingRequests.id, guestPhone: bookingRequests.guestPhone })
    .from(bookingRequests)
    .where(sql`${bookingRequests.guestPhoneNormalized} IS NULL AND ${bookingRequests.guestPhone} IS NOT NULL`);

  let updated = 0;
  for (const row of rows) {
    const normalized = guestPhoneNormalized(row.guestPhone);
    if (!normalized) continue;
    await db
      .update(bookingRequests)
      .set({ guestPhoneNormalized: normalized })
      .where(eq(bookingRequests.id, row.id));
    updated++;
  }
  return updated;
}

// --- Customer reviews ---

export async function listReviews(): Promise<CustomerReview[]> {
  const db = await requireDb();
  return db.select().from(customerReviews).orderBy(desc(customerReviews.createdAt));
}

export async function getPublishedReviews(): Promise<CustomerReview[]> {
  const db = await requireDb();
  return db
    .select()
    .from(customerReviews)
    .where(eq(customerReviews.isPublished, true))
    .orderBy(desc(customerReviews.createdAt));
}

export async function getReviewById(id: number): Promise<CustomerReview | undefined> {
  const db = await requireDb();
  const rows = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
  return rows[0];
}

export async function insertReview(data: InsertCustomerReview): Promise<number> {
  const db = await requireDb();
  const result = await db.insert(customerReviews).values(data);
  return Number(result[0].insertId);
}

export async function updateReview(id: number, data: Partial<InsertCustomerReview>) {
  const db = await requireDb();
  await db.update(customerReviews).set(data).where(eq(customerReviews.id, id));
}

export async function deleteReview(id: number): Promise<boolean> {
  const db = await requireDb();
  const result = await db.delete(customerReviews).where(eq(customerReviews.id, id));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function countPendingReviews(): Promise<number> {
  const db = await requireDb();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(customerReviews)
    .where(eq(customerReviews.isPublished, false));
  return Number(rows[0]?.count ?? 0);
}

export async function countAllReviews(): Promise<number> {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(customerReviews);
  return Number(rows[0]?.count ?? 0);
}
