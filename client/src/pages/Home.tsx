import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSection } from "@/components/site/HeroSection";
import { ScrollPanelExperience } from "@/components/site/ScrollPanelExperience";
import { PropertyDetailsSection } from "@/components/site/PropertyDetailsSection";
import { GallerySection } from "@/components/site/GallerySection";
import { AmenitiesSection } from "@/components/site/AmenitiesSection";
import { LocationSection } from "@/components/site/LocationSection";
import { PricingSection } from "@/components/site/PricingSection";
import { VipSection } from "@/components/site/VipSection";
import { BookingSection } from "@/components/site/BookingSection";
import { ContactSection } from "@/components/site/ContactSection";
import { PolicySection } from "@/components/site/PolicySection";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <PropertyDetailsSection />
        <ScrollPanelExperience />
        <GallerySection />
        <AmenitiesSection />
        <LocationSection />
        <PricingSection />
        <VipSection />
        <BookingSection />
        <ContactSection />
        <PolicySection />
      </main>
      <SiteFooter />
    </div>
  );
}
