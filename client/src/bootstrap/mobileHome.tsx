import { lazy, Suspense, useCallback, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PreloaderMobile } from "@/components/site/PreloaderMobile";
import { CookieConsent } from "@/components/site/CookieConsent";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SiteReadyProvider } from "@/contexts/SiteReadyContext";
import { mountFullApp } from "./fullApp";

const MobileHomePage = lazy(() => import("@/pages/HomeMobile"));

let root: Root | null = null;

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
              <Suspense fallback={<div className="min-h-screen bg-[var(--ink)]" aria-hidden />}>
                <MobileHomePage onNavigateRequest={mountFullApp} />
              </Suspense>
              <CookieConsent />
            </ThemeProvider>
          </ConsentProvider>
        </SiteReadyProvider>
      )}
    </>
  );
}

export function mountMobileHome() {
  const el = document.getElementById("root");
  if (!el) return;

  root = createRoot(el);
  root.render(<MobileHomeBootstrap />);
}
