import { preloadSection, scrollToSection } from "./scroll";

export type SiteNavLink = {
  href: string;
  label: string;
  /** Route navigation (e.g. /pamporovo) instead of in-page scroll */
  page?: boolean;
};

export function navigateSiteLink(
  link: SiteNavLink,
  setLocation: (path: string) => void,
  currentPath: string
) {
  const isRoutePage =
    link.page || (link.href.startsWith("/") && !link.href.startsWith("/#"));

  if (isRoutePage) {
    setLocation(link.href);
    window.scrollTo(0, 0);
    return;
  }

  const sectionId = link.href.replace(/^\/?#/, "");

  if (currentPath !== "/") {
    window.location.href = `/#${sectionId}`;
    return;
  }

  preloadSection(sectionId);
  scrollToSection(`#${sectionId}`);
}

export function navigateToHomeSection(
  sectionId: string,
  setLocation: (path: string) => void,
  currentPath: string
) {
  navigateSiteLink({ href: `#${sectionId.replace(/^#/, "")}`, label: "" }, setLocation, currentPath);
}
