import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { HOME_FAQ } from "@shared/homeFaq";
import {
  loadClientMessages,
  loadClientMessagesAsync,
  resolveMessage,
  type FlatMessages,
} from "@/i18n/loadMessages";
import { SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import { usePageLang } from "@/hooks/usePageLang";

type LocaleContextValue = {
  locale: SiteLocale;
  t: (key: string, fallback?: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = usePageLang();
  const [localeMessages, setLocaleMessages] = useState<FlatMessages>(() =>
    loadClientMessages(locale)
  );

  useEffect(() => {
    if (locale === SOURCE_LOCALE) {
      setLocaleMessages(loadClientMessages(SOURCE_LOCALE));
      return;
    }
    let cancelled = false;
    void loadClientMessagesAsync(locale).then((messages) => {
      if (!cancelled) setLocaleMessages(messages);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const value = useMemo(() => {
    const bgMessages = loadClientMessages(SOURCE_LOCALE);
    const t = (key: string, fallback?: string) =>
      resolveMessage(localeMessages, key) ??
      resolveMessage(bgMessages, key) ??
      fallback ??
      key;
    return { locale, t };
  }, [locale, localeMessages]);

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

/** Homepage FAQ from locale files (faq.home.{id}.*) */
export function useHomeFaqItems() {
  const { t } = useTranslation();
  return HOME_FAQ.map((item) => ({
    id: item.id,
    question: t(`faq.home.${item.id}.question`, item.question),
    answer: t(`faq.home.${item.id}.answer`, item.answer),
  }));
}
