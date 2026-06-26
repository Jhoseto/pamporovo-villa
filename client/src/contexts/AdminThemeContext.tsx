import { createContext, useContext, type ReactNode } from "react";
import { useAdminTheme, type AdminTheme } from "@/hooks/useAdminTheme";

type AdminThemeContextValue = {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const value = useAdminTheme();
  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminThemeContext() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminThemeContext must be used within AdminThemeProvider");
  }
  return ctx;
}
