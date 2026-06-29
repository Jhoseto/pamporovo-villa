function slugPart(value: string, maxLen = 48): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, maxLen);
}

export function phoneForFilename(phone: string | null | undefined): string {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "bez-telefon";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) digits = `359${digits.slice(1)}`;
  return digits;
}

export function confirmationCardFilename(input: {
  guestName: string;
  guestPhone?: string | null;
  checkInDate: string;
}): string {
  const name = slugPart(input.guestName) || "klient";
  const phone = phoneForFilename(input.guestPhone);
  const date = input.checkInDate.slice(0, 10);
  return `pamporovo-villa-${name}-${phone}-${date}.jpg`;
}
