import { lazy, Suspense } from "react";
import { useSiteReady } from "@/contexts/SiteReadyContext";
import { EXPERIENCE_PANELS } from "@/data/experiencePanels";
import { isMobileViewport } from "@/lib/mobilePerf";

const PropertyDetailsSection = lazy(() =>
  import("@/components/site/PropertyDetailsSection").then(m => ({
    default: m.PropertyDetailsSection,
  }))
);
const ScrollPanelExperience = lazy(() =>
  import("@/components/site/ScrollPanelExperience").then(m => ({
    default: m.ScrollPanelExperience,
  }))
);

function MobileDeferredPlaceholder() {
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

/** Desktop: mount immediately (unchanged). Mobile: defer mount until preloader finishes. */
export function HomeBelowFoldSections() {
  const siteReady = useSiteReady();
  const isMobile = isMobileViewport();

  if (isMobile && !siteReady) {
    return <MobileDeferredPlaceholder />;
  }

  return (
    <Suspense
      fallback={
        <>
          <div id="about" className="section-scroll-target">
            <div className="min-h-[50dvh] bg-[var(--cream)]" aria-hidden />
          </div>
          <div id="experience" className="section-scroll-target">
            <div
              className="bg-[var(--ink)]"
              style={{ minHeight: `${EXPERIENCE_PANELS.length * 100}dvh` }}
              aria-hidden
            />
          </div>
        </>
      }
    >
      <PropertyDetailsSection />
      <ScrollPanelExperience />
    </Suspense>
  );
}
