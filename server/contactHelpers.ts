import { normalizeEmail, normalizePhone, storedPhoneDigits } from "@shared/phoneNormalize";
import type { BookingRequest, ClientContact } from "../drizzle/schema";

export type VipLookup = {
  phones: Set<string>;
  emails: Set<string>;
};

export function buildVipLookup(
  contacts: { phoneNormalized: string | null; email: string | null }[]
): VipLookup {
  const phones = new Set<string>();
  const emails = new Set<string>();
  for (const contact of contacts) {
    if (contact.phoneNormalized) phones.add(contact.phoneNormalized);
    const email = normalizeEmail(contact.email);
    if (email) emails.add(email);
  }
  return { phones, emails };
}

export function isGuestVip(
  phoneNormalized: string | null | undefined,
  email: string | null | undefined,
  lookup: VipLookup
): boolean {
  if (phoneNormalized && lookup.phones.has(phoneNormalized)) return true;
  const normalizedEmail = normalizeEmail(email);
  return !!normalizedEmail && lookup.emails.has(normalizedEmail);
}

export function contactFieldsFromGuest(input: {
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
}) {
  return {
    fullName: input.guestName.trim(),
    phone: storedPhoneDigits(input.guestPhone),
    phoneNormalized: normalizePhone(input.guestPhone),
    email: normalizeEmail(input.guestEmail),
  };
}

export function guestPhoneNormalized(phone: string | null | undefined): string | null {
  return normalizePhone(phone);
}

export type ContactBookingStats = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
  lastCheckIn: string | null;
};

export function statsFromBookings(bookings: Pick<BookingRequest, "status" | "checkInDate">[]): ContactBookingStats {
  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let rejected = 0;
  let lastCheckIn: string | null = null;

  for (const booking of bookings) {
    if (booking.status === "pending") pending++;
    else if (booking.status === "confirmed") confirmed++;
    else if (booking.status === "completed") completed++;
    else if (booking.status === "rejected") rejected++;

    const checkIn =
      booking.checkInDate instanceof Date
        ? booking.checkInDate.toISOString().slice(0, 10)
        : String(booking.checkInDate).slice(0, 10);
    if (!lastCheckIn || checkIn > lastCheckIn) lastCheckIn = checkIn;
  }

  return {
    total: bookings.length,
    pending,
    confirmed,
    completed,
    rejected,
    lastCheckIn,
  };
}

export function bookingMatchesContact(
  booking: Pick<BookingRequest, "guestPhoneNormalized" | "guestEmail">,
  contact: Pick<ClientContact, "phoneNormalized" | "email">
): boolean {
  if (contact.phoneNormalized && booking.guestPhoneNormalized) {
    return contact.phoneNormalized === booking.guestPhoneNormalized;
  }
  const contactEmail = normalizeEmail(contact.email);
  const bookingEmail = normalizeEmail(booking.guestEmail);
  if (contactEmail && bookingEmail) return contactEmail === bookingEmail;
  return false;
}
