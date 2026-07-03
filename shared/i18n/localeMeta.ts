import { absoluteUrl } from "../seoConstants";
import { PAMPOROVO_SPOKES, spokePath } from "../pamporovoSpokes";
import { VILLA_PAGE_CONFIGS, villaPath } from "../villaPages";
import { LOCALE_META, SOURCE_LOCALE, TARGET_LOCALES, type SiteLocale } from "./locales";

/** Public content routes with locale variants — hreflang + sitemap */
export const HREFLANG_PATHS = new Set([
  "/",
  "/rent",
  "/pamporovo",
  ...PAMPOROVO_SPOKES.map((s) => spokePath(s.slug)),
  ...VILLA_PAGE_CONFIGS.map((v) => villaPath(v.id)),
]);

export function localizedUrl(pathname: string, lang: SiteLocale): string {
  const base = pathname === "/" ? absoluteUrl("/") : absoluteUrl(pathname);
  if (lang === SOURCE_LOCALE) return base;
  return `${base}${base.includes("?") ? "&" : "?"}lang=${lang}`;
}

export function hreflangTagsForPath(pathname: string): Array<{ lang: string; href: string }> {
  if (!HREFLANG_PATHS.has(pathname)) return [];
  const tags: Array<{ lang: string; href: string }> = [
    { lang: LOCALE_META.bg.hreflang, href: localizedUrl(pathname, SOURCE_LOCALE) },
    ...TARGET_LOCALES.map((code) => ({
      lang: LOCALE_META[code].hreflang,
      href: localizedUrl(pathname, code),
    })),
    { lang: "x-default", href: localizedUrl(pathname, SOURCE_LOCALE) },
  ];
  return tags;
}

export function ogLocaleFor(lang: SiteLocale): string {
  return LOCALE_META[lang].ogLocale;
}

export function allLocalizedSitemapUrls(pathname: string): string[] {
  if (!HREFLANG_PATHS.has(pathname)) return [localizedUrl(pathname, SOURCE_LOCALE)];
  return [localizedUrl(pathname, SOURCE_LOCALE), ...TARGET_LOCALES.map((l) => localizedUrl(pathname, l))];
}
