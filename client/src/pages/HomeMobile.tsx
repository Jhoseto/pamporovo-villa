import { lazy, Suspense, useEffect } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSectionLite } from "@/components/site/HeroSectionLite";
import { MobileScrollDeferredBelowFold } from "@/components/site/MobileScrollDeferredBelowFold";
import { scrollToSection } from "@/lib/scroll";

const SiteFooter = lazy(() =>
  import("@/components/site/SiteFooter").then(m => ({ default: m.SiteFooter }))
);

type HomeMobileProps = {
  onNavigateRequest?: () => void;
};

export default function HomeMobile({ onNavigateRequest }: HomeMobileProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const timer = window.setTimeout(() => scrollToSection(hash), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#")) return;
      if (href.startsWith("/") && href !== "/") {
        event.preventDefault();
        window.history.pushState(null, "", href);
        onNavigateRequest?.();
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [onNavigateRequest]);

  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main id="main-content">
        <HeroSectionLite />
        <MobileScrollDeferredBelowFold />
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
