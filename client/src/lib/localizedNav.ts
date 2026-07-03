import { localizedUrl } from "@shared/i18n/localeMeta";
import { SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import { parseSiteLocale } from "@shared/i18n/parseLocale";

/** Append ?lang=xx for non-BG locales; strip param for BG. */
export function withLang(path: string, lang: SiteLocale): string {
  const [basePath, hash = ""] = path.split("#");
  const clean = (basePath.split("?")[0] ?? basePath).trim();
  if (lang === SOURCE_LOCALE) {
    return hash ? `${clean}#${hash}` : clean;
  }
  const localized = localizedUrl(clean, lang).replace(/^https?:\/\/[^/]+/, "");
  return hash ? `${localized}#${hash}` : localized;
}

export function switchLangPath(
  currentPath: string,
  _currentSearch: string,
  target: SiteLocale
): string {
  const path = currentPath.split("?")[0] ?? currentPath;
  return withLang(path, target);
}

/** @deprecated Use switchLangPath */
export const toggleLangPath = switchLangPath;

export function preserveLangOnPath(path: string, search: string): string {
  const lang = parseSiteLocale(search);
  return withLang(path, lang);
}
