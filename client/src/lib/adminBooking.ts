import { VILLA_LABELS, type VillaId } from "@shared/villas";
import { bookingSourceLabel, bookingStatusLabel, type BookingStatusKey } from "@/lib/adminLabels";

type BookingSummary = {
  id: number;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestNote?: string | null;
  adminNote?: string | null;
  status: BookingStatusKey;
  source?: "website" | "manual";
};

export function formatBookingSummary(booking: BookingSummary): string {
  const villa = VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId;
  const lines = [
    `Резервация #${booking.id}`,
    `${booking.guestName}`,
    `${villa}`,
    `${booking.checkInDate} → ${booking.checkOutDate}`,
    `${booking.numberOfGuests} гости`,
    `Статус: ${bookingStatusLabel(booking.status)}`,
  ];
  if (booking.source) lines.push(`Източник: ${bookingSourceLabel(booking.source)}`);
  if (booking.guestPhone) lines.push(`Тел: ${booking.guestPhone}`);
  if (booking.guestEmail) lines.push(`Имейл: ${booking.guestEmail}`);
  if (booking.guestNote) lines.push(`Бележка: ${booking.guestNote}`);
  if (booking.adminNote) lines.push(`Админ: ${booking.adminNote}`);
  return lines.join("\n");
}

export function whatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export async function copyBookingSummary(booking: BookingSummary): Promise<void> {
  await navigator.clipboard.writeText(formatBookingSummary(booking));
}
