import { useCallback } from "react";
import { usePageLang, usePageSearch } from "@/hooks/usePageLang";
import { preserveLangOnPath, toBrowserPath } from "@/lib/localizedNav";
import type { SiteLocale } from "@shared/i18n/locales";

/** Navigate and build hrefs while preserving the active ?lang= selection. */
export function useLocalizedNav() {
  const search = usePageSearch();
  const lang = usePageLang();

  const href = useCallback((path: string) => preserveLangOnPath(path, search), [search]);

  const navigate = useCallback(
    (path: string) => {
      window.location.assign(toBrowserPath(preserveLangOnPath(path, search)));
    },
    [search]
  );

  return { href, navigate, lang: lang as SiteLocale, search };
}

export function assignLocalized(path: string, search?: string): void {
  const current =
    search ?? (typeof window !== "undefined" ? window.location.search : "");
  window.location.assign(toBrowserPath(preserveLangOnPath(path, current)));
}
