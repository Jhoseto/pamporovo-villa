import { getLenis } from "./lenis";

const HEADER_OFFSET = 80;

/** Full-bleed / sticky viewport sections — pin flush to the viewport top */
const FULL_VIEWPORT_SECTIONS = new Set(["hero", "experience"]);

function getScrollOffset(sectionId: string): number {
  const id = sectionId.replace(/^#/, "");
  return FULL_VIEWPORT_SECTIONS.has(id) ? 0 : -HEADER_OFFSET;
}

export function scrollToSection(sectionId: string) {
  const id = sectionId.replace(/^#/, "");
  const element = document.getElementById(id);
  if (!element) return;

  const offset = getScrollOffset(id);
  const lenis = getLenis();

  if (lenis) {
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
