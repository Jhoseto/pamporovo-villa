import { localizedUrl, type SeoLang } from "@shared/seoEnMeta";

/** Append ?lang=en when switching to English; strip param for BG. */
export function withLang(path: string, lang: SeoLang): string {
  const base = path.split("?")[0] ?? path;
  if (lang === "bg") return base;
  return localizedUrl(base, "en").replace(/^https?:\/\/[^/]+/, "");
}

export function toggleLangPath(currentPath: string, currentSearch: string, target: SeoLang): string {
  const path = currentPath.split("?")[0] ?? currentPath;
  if (target === "en") {
    const url = new URL(path, "http://local");
    url.searchParams.set("lang", "en");
    return `${url.pathname}${url.search}`;
  }
  return path;
}
