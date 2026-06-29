export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "rejected"] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Непотвърдена",
  confirmed: "Потвърдена",
  completed: "Гостували",
  rejected: "Отказана",
};

export function bookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status];
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

/** Statuses that block the villa calendar for new confirmed bookings. */
export const BOOKING_BLOCKING_STATUSES = ["confirmed"] as const satisfies readonly BookingStatus[];
