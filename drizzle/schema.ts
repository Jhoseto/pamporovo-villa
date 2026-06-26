import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isMaster: boolean("is_master").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

export const bookingRequests = mysqlTable("booking_requests", {
  id: int("id").autoincrement().primaryKey(),
  villaId: varchar("villa_id", { length: 32 }).notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  numberOfGuests: int("number_of_guests").notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 320 }),
  guestPhone: varchar("guest_phone", { length: 32 }),
  guestNote: text("guest_note"),
  adminNote: text("admin_note"),
  status: mysqlEnum("status", ["pending", "confirmed", "rejected"]).default("pending").notNull(),
  source: mysqlEnum("source", ["website", "manual"]).default("website").notNull(),
  createdByAdminId: int("created_by_admin_id"),
  processedAt: timestamp("processed_at"),
  processedByAdminId: int("processed_by_admin_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BookingRequest = typeof bookingRequests.$inferSelect;
export type InsertBookingRequest = typeof bookingRequests.$inferInsert;

export const villaPricing = mysqlTable(
  "villa_pricing",
  {
    id: int("id").autoincrement().primaryKey(),
    villaId: varchar("villa_id", { length: 32 }).notNull(),
    tierKey: varchar("tier_key", { length: 32 }).notNull(),
    tierLabel: varchar("tier_label", { length: 128 }).notNull(),
    winterPerNight: int("winter_per_night").notNull(),
    summerPerNight: int("summer_per_night").notNull(),
    sortOrder: int("sort_order").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("villa_tier_idx").on(table.villaId, table.tierKey)]
);

export type VillaPricing = typeof villaPricing.$inferSelect;
export type InsertVillaPricing = typeof villaPricing.$inferInsert;

export const pricingExtras = mysqlTable("pricing_extras", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }).notNull(),
  amountEur: int("amount_eur").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PricingExtra = typeof pricingExtras.$inferSelect;

export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  priceEur: int("price_eur").notNull(),
  oldPriceEur: int("old_price_eur").notNull(),
  period: varchar("period", { length: 255 }).notNull(),
  description: text("description").notNull(),
  includesJson: text("includes_json").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("admin_user_id").notNull(),
  endpoint: varchar("endpoint", { length: 512 }).notNull().unique(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  userAgent: varchar("user_agent", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
