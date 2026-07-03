import { createContext, useContext, useMemo, type ReactNode } from "react";
import { loadClientMessages, resolveMessage } from "@/i18n/loadMessages";
import { SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import { usePageLang } from "@/hooks/usePageLang";

type LocaleContextValue = {
  locale: SiteLocale;
  t: (key: string, fallback?: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = usePageLang();
  const value = useMemo(() => {
    const messages = loadClientMessages(locale);
    const bgMessages = loadClientMessages(SOURCE_LOCALE);
    const t = (key: string, fallback?: string) =>
      resolveMessage(messages, key) ?? resolveMessage(bgMessages, key) ?? fallback ?? key;
    return { locale, t };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    const bgMessages = loadClientMessages(SOURCE_LOCALE);
    return {
      locale: SOURCE_LOCALE as SiteLocale,
      t: (key: string, fallback?: string) =>
        resolveMessage(bgMessages, key) ?? fallback ?? key,
    };
  }
  return ctx;
}

/** Nav label helper */
export function useNavLabel(key: string, bgFallback: string): string {
  const { t } = useTranslation();
  return t(`nav.${key}`, bgFallback);
}
