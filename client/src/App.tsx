import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Preloader } from "./components/site/Preloader";
import { PreloaderMobile } from "./components/site/PreloaderMobile";
import { PublicScrollShell } from "./components/site/PublicScrollShell";
import { isMobileViewport } from "./lib/mobilePerf";
import { SiteReadyProvider } from "./contexts/SiteReadyContext";
import { OffersModalProvider } from "./contexts/OffersModalContext";
import { ConsentProvider } from "./contexts/ConsentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/site/CookieConsent";
import { trackAiReferralOnce, trackPublicPageView } from "./lib/analytics/events";
import { initAdminPwaMeta, registerAdminServiceWorker } from "./lib/adminPwa";
import Home from "./pages/Home";

const AdminApp = lazy(() => import("./pages/admin/AdminApp"));
const PamporovoPage = lazy(() => import("./pages/PamporovoPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const RentPage = lazy(() => import("./pages/RentPage"));
const PamporovoSpokePage = lazy(() => import("./pages/PamporovoSpokePage"));
const VillaPage = lazy(() => import("./pages/VillaPage"));

function SiteRouter() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--cream)]" aria-hidden />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/rent"} component={RentPage} />
        <Route path={"/villa/:id"} component={VillaPage} />
        <Route path={"/pamporovo/:slug"} component={PamporovoSpokePage} />
        <Route path={"/pamporovo"} component={PamporovoPage} />
        <Route path={"/legal"} component={LegalPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function PublicApp() {
  const [location] = useLocation();
  const isGuidePage =
    location === "/pamporovo" ||
    location === "/rent" ||
    location.startsWith("/pamporovo/") ||
    location.startsWith("/villa/");
  const [appReady, setAppReady] = useState(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const guide =
      path === "/pamporovo" ||
      path === "/rent" ||
      path.startsWith("/pamporovo/") ||
      path.startsWith("/villa/");
    if (guide) return true;
    if (isMobileViewport() && sessionStorage.getItem("pv-mobile-preloaded") === "1") {
      return true;
    }
    return false;
  });
  const handlePreloaderComplete = useCallback(() => setAppReady(true), []);

  useEffect(() => {
    if (isGuidePage) setAppReady(true);
  }, [isGuidePage]);

  return (
    <>
      {!appReady && !isGuidePage && (
        isMobileViewport() ? (
          <PreloaderMobile onComplete={handlePreloaderComplete} />
        ) : (
          <Preloader onComplete={handlePreloaderComplete} />
        )
      )}
      <PublicScrollShell enabled={appReady}>
        <SiteReadyProvider ready={appReady}>
          <ConsentProvider>
            <ThemeProvider defaultTheme="light">
              <OffersModalProvider>
                <SiteRouter />
                <CookieConsent />
              </OffersModalProvider>
            </ThemeProvider>
          </ConsentProvider>
        </SiteReadyProvider>
      </PublicScrollShell>
    </>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    trackAiReferralOnce();
    trackPublicPageView(location, window.location.search);
  }, [location, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    initAdminPwaMeta();
    void registerAdminServiceWorker();
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="admin-shell flex min-h-screen items-center justify-center">
            <div className="admin-skeleton h-12 w-48 rounded-xl" />
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return <PublicApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <TooltipProvider>
          <Toaster />
          <AppShell />
        </TooltipProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
