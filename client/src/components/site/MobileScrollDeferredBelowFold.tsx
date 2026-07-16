import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { EXPERIENCE_PANELS } from "@/data/experiencePanels";

const HomeBelowFoldMounted = lazy(() =>
  import("@/components/site/HomeBelowFoldMounted").then(m => ({
    default: m.HomeBelowFoldMounted,
  }))
);

function BelowFoldPlaceholder() {
  const experienceHeight = `${EXPERIENCE_PANELS.length * 100}dvh`;
  return (
    <>
      <div id="about" className="section-scroll-target">
        <div className="min-h-[50dvh] bg-[var(--cream)]" aria-hidden />
      </div>
      <div id="experience" className="section-scroll-target">
        <div className="bg-[var(--ink)]" style={{ minHeight: experienceHeight }} aria-hidden />
      </div>
    </>
  );
}

/** Mount below-fold chunks only after user scrolls — keeps PSI initial payload smaller. */
export function MobileScrollDeferredBelowFold({ fallback }: { fallback?: ReactNode }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.scrollY > 80) {
      setActive(true);
      return;
    }

    const onScroll = () => {
      if (window.scrollY > 80) setActive(true);
    };
    const onHashNav = () => {
      const hash = window.location.hash;
      if (hash === "#about" || hash === "#experience") setActive(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHashNav);
    onHashNav();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHashNav);
    };
  }, []);

  if (!active) {
    return <>{fallback ?? <BelowFoldPlaceholder />}</>;
  }

  return (
    <Suspense fallback={fallback ?? <BelowFoldPlaceholder />}>
      <HomeBelowFoldMounted />
    </Suspense>
  );
}
