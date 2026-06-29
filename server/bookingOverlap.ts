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
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function validateStayDates(checkIn: string, checkOut: string): void {
  if (checkOut <= checkIn) {
    throw new Error("Датата на напускане трябва да е след настаняване");
  }
}
