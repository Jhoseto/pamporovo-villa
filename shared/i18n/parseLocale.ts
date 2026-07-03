import { isSiteLocale, SOURCE_LOCALE, type SiteLocale } from "./locales";

/** Parse ?lang=xx from URL search — defaults to Bulgarian. */
export function parseSiteLocale(search: string): SiteLocale {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const lang = params.get("lang")?.toLowerCase();
    if (lang && isSiteLocale(lang) && lang !== SOURCE_LOCALE) {
      return lang;
    }
    return SOURCE_LOCALE;
  } catch {
    return SOURCE_LOCALE;
  }
}

/** @deprecated Use SiteLocale — kept for gradual migration */
export type SeoLang = SiteLocale;

/** @deprecated Use parseSiteLocale */
export const parseSeoLang = parseSiteLocale;
