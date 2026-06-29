import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, bookingStatusLabel } from "@shared/bookingStatus";

export type BookingStatusKey = (typeof BOOKING_STATUSES)[number];

export { BOOKING_STATUSES, BOOKING_STATUS_LABELS, bookingStatusLabel };

export const BOOKING_SOURCE_LABELS = {
  website: "От сайта",
  manual: "Ръчна",
} as const;

export function bookingSourceLabel(source: keyof typeof BOOKING_SOURCE_LABELS): string {
  return BOOKING_SOURCE_LABELS[source] ?? source;
}

export function adminRoleLabel(isMaster: boolean): string {
  return isMaster ? "Главен администратор" : "Администратор";
}
