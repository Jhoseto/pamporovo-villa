import { preloadSection, scrollToSection } from "./scroll";
import { trackBookStart } from "./analytics/events";
import { parseSiteLocale } from "@shared/i18n/parseLocale";
import { SOURCE_LOCALE } from "@shared/i18n/locales";
import { toBrowserPath, withLang } from "./localizedNav";

export type SiteNavLink = {
  href: string;
  label: string;
  /** Route navigation (e.g. /pamporovo) instead of in-page scroll */
  page?: boolean;
};

function needsFullNavigation(target: string, lang: ReturnType<typeof parseSiteLocale>): boolean {
  return lang !== SOURCE_LOCALE || target.includes("?");
}

export function navigateSiteLink(
  link: SiteNavLink,
  setLocation: (path: string) => void,
  currentPath: string,
  currentSearch?: string
) {
  const search = currentSearch ?? (typeof window !== "undefined" ? window.location.search : "");
  const lang = parseSiteLocale(search);
  const pathOnly = currentPath.split("?")[0] ?? currentPath;
  const isRoutePage =
    link.page || (link.href.startsWith("/") && !link.href.startsWith("/#"));

  if (isRoutePage) {
    const target = withLang(link.href, lang);
    if (needsFullNavigation(target, lang)) {
      window.location.assign(toBrowserPath(target));
      return;
    }
    setLocation(target);
    window.scrollTo(0, 0);
    return;
  }

  const sectionId = link.href.replace(/^\/?#/, "");

  if (sectionId === "booking") {
    trackBookStart(pathOnly === "/" ? "home" : pathOnly);
  }

  if (pathOnly !== "/") {
    window.location.assign(toBrowserPath(withLang(`/#${sectionId}`, lang)));
    return;
  }

  preloadSection(sectionId);
  scrollToSection(`#${sectionId}`);
}

export function navigateToHomeSection(
  sectionId: string,
  setLocation: (path: string) => void,
  currentPath: string,
  currentSearch?: string
) {
  navigateSiteLink(
    { href: `#${sectionId.replace(/^#/, "")}`, label: "" },
    setLocation,
    currentPath,
    currentSearch
  );
}
