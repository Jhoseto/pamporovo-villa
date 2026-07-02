import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  type CookieConsent,
} from "./types";

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION || parsed.necessary !== true) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    return null;
  }
}

export function writeConsent(consent: CookieConsent): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}
