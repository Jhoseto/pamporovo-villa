/** Date overlap for hotel-style stays: [checkIn, checkOut) */
export function datesOverlap(
  aCheckIn: string | Date,
  aCheckOut: string | Date,
  bCheckIn: string | Date,
  bCheckOut: string | Date
): boolean {
  const aIn = toDateStr(aCheckIn);
  const aOut = toDateStr(aCheckOut);
  const bIn = toDateStr(bCheckIn);
  const bOut = toDateStr(bCheckOut);
  return aIn < bOut && bIn < aOut;
}

function toDateStr(d: string | Date): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function validateStayDates(checkIn: string, checkOut: string): void {
  if (checkOut <= checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }
}
