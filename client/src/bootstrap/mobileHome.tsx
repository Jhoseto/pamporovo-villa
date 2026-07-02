import { lazy, Suspense, useCallback, useState } from "react";
import { PreloaderMobile } from "@/components/site/PreloaderMobile";
import { CookieConsent } from "@/components/site/CookieConsent";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { OffersModalProvider } from "@/contexts/OffersModalContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteReadyProvider } from "@/contexts/SiteReadyContext";
import { getAppRoot } from "./appRoot";
import { mountFullApp } from "./fullApp";

const MobileHomePage = lazy(() => import("@/pages/HomeMobile"));

function MobileHomeBootstrap() {
  const [appReady, setAppReady] = useState(false);
  const onPreloaderComplete = useCallback(() => setAppReady(true), []);

  return (
    <>
      {!appReady && <PreloaderMobile onComplete={onPreloaderComplete} />}
      {appReady && (
        <SiteReadyProvider ready>
          <ConsentProvider>
            <ThemeProvider defaultTheme="light">
              <OffersModalProvider>
                <Suspense fallback={<div className="min-h-screen bg-[var(--ink)]" aria-hidden />}>
                  <MobileHomePage onNavigateRequest={mountFullApp} />
                </Suspense>
                <CookieConsent />
              </OffersModalProvider>
            </ThemeProvider>
          </ConsentProvider>
        </SiteReadyProvider>
      )}
    </>
  );
}

export function mountMobileHome() {
  getAppRoot()?.render(<MobileHomeBootstrap />);
}
