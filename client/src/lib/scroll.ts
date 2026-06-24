import { getLenis } from "./lenis";

const HEADER_OFFSET = 80;

export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId.replace(/^#/, ""));
  if (!element) return;

  const lenis = getLenis();

  if (lenis) {
    lenis.scrollTo(element, { offset: -HEADER_OFFSET, duration: 1.6 });
    return;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
