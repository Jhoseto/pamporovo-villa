import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { parseSiteLocale } from "@shared/i18n/parseLocale";
import type { SiteLocale } from "@shared/i18n/locales";

export function usePageLang(): SiteLocale {
  const [location] = useLocation();
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);

  return parseSiteLocale(search);
}

export function usePageSearch(): string {
  const [location] = useLocation();
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);

  return search;
}
