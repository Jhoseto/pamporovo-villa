const PHONE_MAX_LENGTH = 32;

/** Keep only digits — for live input and stored phone values. */
export function digitsOnlyPhoneInput(value: string, maxLength = PHONE_MAX_LENGTH): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

/** Stored phone: digits only, or null when empty. */
export function storedPhoneDigits(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  return digitsOnlyPhoneInput(phone) || null;
}

/** Strip to digits; normalize Bulgarian mobiles to 359XXXXXXXXX when possible. */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;

  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("359")) {
    return digits.length >= 11 ? digits.slice(0, 12) : digits;
  }

  if (digits.startsWith("0") && digits.length >= 10) {
    return `359${digits.slice(1)}`;
  }

  return digits;
}

/** Last 9 digits — local BG mobile without country/leading zero. */
export function phoneLocalSuffix(phone: string | null | undefined): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  if (normalized.length >= 9) return normalized.slice(-9);
  return normalized;
}

export function phonesMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (na && nb) return na === nb;
  const sa = phoneLocalSuffix(a);
  const sb = phoneLocalSuffix(b);
  return !!sa && !!sb && sa === sb;
}

/** Digit patterns for SQL LIKE — matches +359, 0, spaces, dashes in stored values. */
export function phoneSearchPatterns(query: string): string[] {
  const normalized = normalizePhone(query);
  const local = phoneLocalSuffix(query);
  const patterns = new Set<string>();
  if (normalized) patterns.add(normalized);
  if (local) patterns.add(local);
  const rawDigits = query.replace(/\D/g, "");
  if (rawDigits.length >= 3) {
    patterns.add(rawDigits);
    if (rawDigits.startsWith("0")) patterns.add(rawDigits.slice(1));
    if (rawDigits.startsWith("359")) patterns.add(rawDigits.slice(3));
  }
  return Array.from(patterns);
}

export function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}
