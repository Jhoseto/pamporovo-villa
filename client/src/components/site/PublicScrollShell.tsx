import type { ReactNode } from "react";
import { lazy, Suspense, useEffect } from "react";
import { isMobileViewport } from "@/lib/mobilePerf";

const DesktopSmoothScroll = lazy(() =>
  import("./SmoothScrollProvider").then(m => ({ default: m.SmoothScrollProvider }))
);

type PublicScrollShellProps = {
  children: ReactNode;
  enabled?: boolean;
};

function MobileNativeScroll({ children, enabled }: PublicScrollShellProps) {
  useEffect(() => {
    if (!enabled) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [enabled]);

  return <>{children}</>;
}

/** Mobile: native scroll, no Lenis chunk. Desktop: unchanged smooth scroll. */
export function PublicScrollShell({ children, enabled = true }: PublicScrollShellProps) {
  if (isMobileViewport()) {
    return <MobileNativeScroll enabled={enabled}>{children}</MobileNativeScroll>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <DesktopSmoothScroll enabled={enabled}>{children}</DesktopSmoothScroll>
    </Suspense>
  );
}
