import { lazy, Suspense, useCallback, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Preloader } from "./components/site/Preloader";
import { SmoothScrollProvider } from "./components/site/SmoothScrollProvider";
import { SiteReadyProvider } from "./contexts/SiteReadyContext";
import { OffersModalProvider } from "./contexts/OffersModalContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

function SiteRouter() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicApp() {
  const [appReady, setAppReady] = useState(false);
  const handlePreloaderComplete = useCallback(() => setAppReady(true), []);

  return (
    <>
      {!appReady && <Preloader onComplete={handlePreloaderComplete} />}
      <SmoothScrollProvider enabled={appReady}>
        <SiteReadyProvider ready={appReady}>
          <ThemeProvider defaultTheme="light">
            <OffersModalProvider>
              <SiteRouter />
            </OffersModalProvider>
          </ThemeProvider>
        </SiteReadyProvider>
      </SmoothScrollProvider>
    </>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

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
