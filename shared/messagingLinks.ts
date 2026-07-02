import { normalizePhone } from "./phoneNormalize";

/** International E.164 digits without + (e.g. 359879501660). */
export function phoneE164Digits(phone: string | null | undefined): string | null {
  return normalizePhone(phone);
}

/**
 * Opens a 1:1 Viber chat. Uses viber://chat/?number=+…&draft=…
 * @see https://stackoverflow.com/questions/75662482/viber-href-link-works-on-pc-not-on-mobile
 */
export function viberChatUrl(phone: string, draft?: string): string | null {
  const digits = phoneE164Digits(phone);
  if (!digits) return null;

  const params = new URLSearchParams();
  params.set("number", `+${digits}`);
  if (draft?.trim()) params.set("draft", draft.trim());

  return `viber://chat/?${params.toString()}`;
}
