/** Viewport ≤767px — matches Tailwind `md` breakpoint and mobile PSI profile. */
export function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}
