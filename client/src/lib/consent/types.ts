export const CONSENT_STORAGE_KEY = "pamporovo_cookie_consent";
export const CONSENT_VERSION = 1 as const;

export interface CookieConsent {
  version: typeof CONSENT_VERSION;
  updatedAt: number;
  necessary: true;
  analytics: boolean;
  functional: boolean;
}

export type ConsentCategory = "analytics" | "functional";

export function createConsent(partial: Pick<CookieConsent, "analytics" | "functional">): CookieConsent {
  return {
    version: CONSENT_VERSION,
    updatedAt: Date.now(),
    necessary: true,
    analytics: partial.analytics,
    functional: partial.functional,
  };
}

export const CONSENT_ALL = createConsent({ analytics: true, functional: true });
export const CONSENT_NECESSARY_ONLY = createConsent({ analytics: false, functional: false });
