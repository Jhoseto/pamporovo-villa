import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSection } from "@/components/site/HeroSection";
import { ScrollPanelExperience } from "@/components/site/ScrollPanelExperience";
import { PropertyDetailsSection } from "@/components/site/PropertyDetailsSection";
import { SiteFooter } from "@/components/site/SiteFooter";

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

// Minimal fallback — invisible placeholder that holds layout height
function SectionFallback() {
  return <div className="min-h-[20dvh] bg-[var(--cream)]" aria-hidden />;
}

function DarkSectionFallback() {
  return <div className="min-h-[20dvh] bg-[var(--ink)]" aria-hidden />;
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <PropertyDetailsSection />
        <ScrollPanelExperience />
        <Suspense fallback={<DarkSectionFallback />}>
          <GallerySection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <AmenitiesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <LocationSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <VipSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <BookingSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ContactSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PolicySection />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
