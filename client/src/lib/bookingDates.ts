import type { DateRange } from "react-day-picker";

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function updateBookingDateRange(
  current: DateRange | undefined,
  clickedDate: Date
): DateRange | undefined {
  const day = startOfDay(clickedDate);
  const today = startOfDay(new Date());

  if (day < today) {
    return current;
  }

  const currentFrom = current?.from ? startOfDay(current.from) : undefined;
  const currentTo = current?.to ? startOfDay(current.to) : undefined;

  if (!currentFrom) {
    return { from: clickedDate, to: undefined };
  }

  if (!currentTo) {
    if (day.getTime() === currentFrom.getTime()) {
      return undefined;
    }

    if (day < currentFrom) {
      return { from: clickedDate, to: undefined };
    }

    return { from: current!.from, to: clickedDate };
  }

  if (day.getTime() === currentFrom.getTime()) {
    return { from: current!.from, to: undefined };
  }

  if (day.getTime() === currentTo.getTime()) {
    return { from: current!.from, to: undefined };
  }

  if (day < currentFrom) {
    return { from: clickedDate, to: current!.to };
  }

  if (day > currentTo) {
    return { from: current!.from, to: clickedDate };
  }

  const distFrom = day.getTime() - currentFrom.getTime();
  const distTo = currentTo.getTime() - day.getTime();

  if (distFrom <= distTo) {
    return { from: clickedDate, to: current!.to };
  }

  return { from: current!.from, to: clickedDate };
}
