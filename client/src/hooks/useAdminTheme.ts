import { useCallback, useEffect, useState } from "react";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "pamporovo-admin-theme";

function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyAdminTheme(theme: AdminTheme) {
  const root = document.documentElement;
  root.classList.add("admin-mode");
  root.classList.toggle("admin-dark", theme === "dark");

  const themeColor = theme === "dark" ? "#1c1917" : "#f8f6f2";
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", themeColor);
}

export function useAdminTheme() {
  const [theme, setTheme] = useState<AdminTheme>(readStoredTheme);

  useEffect(() => {
    applyAdminTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(current => (current === "light" ? "dark" : "light"));
  }, []);

  return { theme, setTheme, toggleTheme };
}

/** Call once on admin app mount (before paint if possible). */
export function initAdminThemeFromStorage() {
  applyAdminTheme(readStoredTheme());
}
