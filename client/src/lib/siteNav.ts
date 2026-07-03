import { preloadSection, scrollToSection } from "./scroll";
import { trackBookStart } from "./analytics/events";
import { parseSiteLocale } from "@shared/i18n/parseLocale";
import { withLang } from "./localizedNav";

export type SiteNavLink = {
  href: string;
  label: string;
  /** Route navigation (e.g. /pamporovo) instead of in-page scroll */
  page?: boolean;
};

export function navigateSiteLink(
  link: SiteNavLink,
  setLocation: (path: string) => void,
  currentPath: string,
  currentSearch?: string
) {
  const search = currentSearch ?? (typeof window !== "undefined" ? window.location.search : "");
  const lang = parseSiteLocale(search);
  const isRoutePage =
    link.page || (link.href.startsWith("/") && !link.href.startsWith("/#"));

  if (isRoutePage) {
    setLocation(withLang(link.href, lang));
    window.scrollTo(0, 0);
    return;
  }

  const sectionId = link.href.replace(/^\/?#/, "");

  if (sectionId === "booking") {
    trackBookStart(currentPath === "/" ? "home" : currentPath);
  }

  if (currentPath !== "/") {
    window.location.href = withLang(`/#${sectionId}`, lang);
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
