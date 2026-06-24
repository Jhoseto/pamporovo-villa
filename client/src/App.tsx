import { useCallback, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Preloader } from "./components/site/Preloader";
import { SmoothScrollProvider } from "./components/site/SmoothScrollProvider";
import { SiteReadyProvider } from "./contexts/SiteReadyContext";
import { OffersModalProvider } from "./contexts/OffersModalContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [appReady, setAppReady] = useState(false);
  const handlePreloaderComplete = useCallback(() => setAppReady(true), []);

  return (
    <ErrorBoundary>
      {!appReady && <Preloader onComplete={handlePreloaderComplete} />}
      <SmoothScrollProvider enabled={appReady}>
        <SiteReadyProvider ready={appReady}>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <OffersModalProvider>
                <Router />
              </OffersModalProvider>
            </TooltipProvider>
          </ThemeProvider>
        </SiteReadyProvider>
      </SmoothScrollProvider>
    </ErrorBoundary>
  );
}

export default App;
