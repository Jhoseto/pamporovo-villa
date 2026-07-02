import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { parseSeoLang, type SeoLang } from "@shared/seoEnMeta";

export function usePageLang(): SeoLang {
  const [location] = useLocation();
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);

  return parseSeoLang(search);
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
