import { getLenis, wakeLenis } from "./lenis";

const HEADER_OFFSET = 80;

/** Full-bleed / sticky viewport sections — pin flush to the viewport top */
const FULL_VIEWPORT_SECTIONS = new Set(["hero", "experience"]);

/** Lazy Home sections — preload chunk when nav targets them before mount. */
const LAZY_SECTION_LOADERS: Record<string, () => Promise<unknown>> = {
  gallery: () => import("@/components/site/GallerySection"),
  amenities: () => import("@/components/site/AmenitiesSection"),
  location: () => import("@/components/site/LocationSection"),
  pricing: () => import("@/components/site/PricingSection"),
  vip: () => import("@/components/site/VipSection"),
  booking: () => import("@/components/site/BookingSection"),
  contact: () => import("@/components/site/ContactSection"),
  policy: () => import("@/components/site/PolicySection"),
  reviews: () => import("@/components/site/ReviewsSection"),
};

function getScrollOffset(sectionId: string): number {
  const id = sectionId.replace(/^#/, "");
  return FULL_VIEWPORT_SECTIONS.has(id) ? 0 : -HEADER_OFFSET;
}

export function preloadSection(sectionId: string) {
  const id = sectionId.replace(/^#/, "");
  const loader = LAZY_SECTION_LOADERS[id];
  if (loader) void loader();
}

export function scrollToSection(sectionId: string, attempt = 0) {
  const id = sectionId.replace(/^#/, "");
  const element = document.getElementById(id);

  if (!element) {
    preloadSection(id);
    if (attempt < 40) {
      window.setTimeout(() => scrollToSection(sectionId, attempt + 1), 80);
    }
    return;
  }

  if (typeof window !== "undefined" && window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", `#${id}`);
  }

  const offset = getScrollOffset(id);
  const lenis = getLenis();

  if (lenis) {
    wakeLenis();
    lenis.scrollTo(element, { offset, duration: 1.6 });
    return;
  }

  const top = element.getBoundingClientRect().top + window.scrollY + offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

/** Jump past the sticky scroll tour without stepping through every panel. */
export function skipExperienceTour(direction: "up" | "down") {
  scrollToSection(direction === "up" ? "about" : "gallery");
}

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
