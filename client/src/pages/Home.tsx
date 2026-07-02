import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { scrollToSection } from "@/lib/scroll";
import { HeroSection } from "@/components/site/HeroSection";
import { HomeBelowFoldSections } from "@/components/site/HomeBelowFoldSections";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSiteReady } from "@/contexts/SiteReadyContext";
import { isMobileViewport } from "@/lib/mobilePerf";

// Below-fold sections loaded lazily — reduces initial JS parse time
// Visible sections (Hero, PropertyDetails, ScrollPanelExperience) remain eager
const GallerySection = lazy(() =>
  import("@/components/site/GallerySection").then(m => ({ default: m.GallerySection }))
);
const AmenitiesSection = lazy(() =>
  import("@/components/site/AmenitiesSection").then(m => ({ default: m.AmenitiesSection }))
);
const LocationSection = lazy(() =>
  import("@/components/site/LocationSection").then(m => ({ default: m.LocationSection }))
);
const PricingSection = lazy(() =>
  import("@/components/site/PricingSection").then(m => ({ default: m.PricingSection }))
);
const VipSection = lazy(() =>
  import("@/components/site/VipSection").then(m => ({ default: m.VipSection }))
);
const BookingSection = lazy(() =>
  import("@/components/site/BookingSection").then(m => ({ default: m.BookingSection }))
);
const ContactSection = lazy(() =>
  import("@/components/site/ContactSection").then(m => ({ default: m.ContactSection }))
);
const PolicySection = lazy(() =>
  import("@/components/site/PolicySection").then(m => ({ default: m.PolicySection }))
);
const ReviewsSection = lazy(() =>
  import("@/components/site/ReviewsSection").then(m => ({ default: m.ReviewsSection }))
);
const HomeFaqSection = lazy(() =>
  import("@/components/site/HomeFaqSection").then(m => ({ default: m.HomeFaqSection }))
);

// Minimal fallback — invisible placeholder that holds layout height
function SectionFallback() {
  return <div className="min-h-[20dvh] bg-[var(--cream)]" aria-hidden />;
}

function DarkSectionFallback() {
  return <div className="min-h-[20dvh] bg-[var(--ink)]" aria-hidden />;
}

/** Always-mounted anchor so navbar scroll works before lazy chunk loads. */
function LazySection({
  id,
  fallback,
  children,
}: {
  id: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  return (
    <div id={id} className="section-scroll-target">
      <Suspense fallback={fallback}>{children}</Suspense>
    </div>
  );
}

export default function Home() {
  const siteReady = useSiteReady();
  const isMobile = isMobileViewport();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const timer = window.setTimeout(() => scrollToSection(hash), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <HomeBelowFoldSections />
        <LazySection id="gallery" fallback={<DarkSectionFallback />}>
          <GallerySection />
        </LazySection>
        <LazySection id="amenities" fallback={<SectionFallback />}>
          <AmenitiesSection />
        </LazySection>
        <LazySection id="location" fallback={<SectionFallback />}>
          <LocationSection />
        </LazySection>
        <LazySection id="pricing" fallback={<SectionFallback />}>
          <PricingSection />
        </LazySection>
        <LazySection id="vip" fallback={<SectionFallback />}>
          <VipSection />
        </LazySection>
        <LazySection id="booking" fallback={<div className="min-h-[120dvh] bg-[var(--cream)]" aria-hidden />}>
          <BookingSection />
        </LazySection>
        <LazySection id="contact" fallback={<SectionFallback />}>
          <ContactSection />
        </LazySection>
        <LazySection id="policy" fallback={<SectionFallback />}>
          <PolicySection />
        </LazySection>
        <LazySection id="reviews" fallback={<SectionFallback />}>
          <ReviewsSection />
        </LazySection>
        <LazySection id="faq" fallback={<SectionFallback />}>
          <HomeFaqSection className="border-t border-black/8 bg-[var(--cream)] py-16 md:py-20" />
        </LazySection>
      </main>
      {(!isMobile || siteReady) && <SiteFooter />}
    </div>
  );
}
