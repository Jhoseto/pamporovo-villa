import { SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import { parseSiteLocale } from "@shared/i18n/parseLocale";

/** Append ?lang=xx for non-BG locales; strip param for BG. Preserves other query params. */
export function withLang(path: string, lang: SiteLocale): string {
  const [basePath, hash = ""] = path.split("#");
  const [pathname, existingQuery = ""] = basePath.split("?");
  const clean = (pathname ?? basePath).trim() || "/";
  const params = new URLSearchParams(existingQuery);

  if (lang === SOURCE_LOCALE) {
    params.delete("lang");
  } else {
    params.set("lang", lang);
  }

  const qs = params.toString();
  const withQuery = qs ? `${clean}?${qs}` : clean;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

/** Resolve a withLang path to a same-origin browser URL (pathname + search + hash). */
export function toBrowserPath(path: string): string {
  if (typeof window === "undefined") return path;
  const url = new URL(path, window.location.origin);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function switchLangPath(
  currentPath: string,
  currentSearch: string,
  target: SiteLocale
): string {
  const path = currentPath.split("?")[0] ?? currentPath;
  const params = new URLSearchParams(
    currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch
  );
  params.delete("lang");
  const qs = params.toString();
  const pathWithQuery = qs ? `${path}?${qs}` : path;
  return withLang(pathWithQuery, target);
}

/** @deprecated Use switchLangPath */
export const toggleLangPath = switchLangPath;

export function preserveLangOnPath(path: string, search: string): string {
  const lang = parseSiteLocale(search);
  return withLang(path, lang);
}
