import { useSearch } from "wouter";
import { parseSiteLocale } from "@shared/i18n/parseLocale";
import type { SiteLocale } from "@shared/i18n/locales";

export function usePageLang(): SiteLocale {
  const search = useSearch();
  return parseSiteLocale(search ? `?${search}` : "");
}

export function usePageSearch(): string {
  const search = useSearch();
  return search ? `?${search}` : "";
}
