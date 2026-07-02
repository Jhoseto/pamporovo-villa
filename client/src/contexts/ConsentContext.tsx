import { applyConsent, trackPageView } from "@/lib/analytics/gtag";
import { readConsent, writeConsent } from "@/lib/consent/storage";
import {
  CONSENT_ALL,
  CONSENT_NECESSARY_ONLY,
  createConsent,
  type CookieConsent,
} from "@/lib/consent/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ConsentContextValue = {
  consent: CookieConsent | null;
  hasAnswered: boolean;
  showBanner: boolean;
  settingsOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (analytics: boolean, functional: boolean) => void;
  enableFunctional: () => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => readConsent());
  const [showBanner, setShowBanner] = useState(() => readConsent() === null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!consent) return;
    void applyConsent(consent.analytics, consent.functional).then(() => {
      if (consent.analytics) {
        trackPageView(window.location.pathname + window.location.search);
      }
    });
  }, [consent]);

  const persist = useCallback((next: CookieConsent) => {
    writeConsent(next);
    setConsent(next);
    setShowBanner(false);
    void applyConsent(next.analytics, next.functional).then(() => {
      if (next.analytics) {
        trackPageView(window.location.pathname + window.location.search);
      }
    });
  }, []);

  const acceptAll = useCallback(() => {
    persist(CONSENT_ALL);
    setSettingsOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist(CONSENT_NECESSARY_ONLY);
    setSettingsOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (analytics: boolean, functional: boolean) => {
      persist(createConsent({ analytics, functional }));
      setSettingsOpen(false);
    },
    [persist]
  );

  const enableFunctional = useCallback(() => {
    const current = consent ?? CONSENT_NECESSARY_ONLY;
    persist(createConsent({ analytics: current.analytics, functional: true }));
  }, [consent, persist]);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo(
    () => ({
      consent,
      hasAnswered: consent !== null,
      showBanner,
      settingsOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      enableFunctional,
      openSettings,
      closeSettings,
    }),
    [
      consent,
      showBanner,
      settingsOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      enableFunctional,
      openSettings,
      closeSettings,
    ]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

export function useConsentOptional() {
  return useContext(ConsentContext);
}
