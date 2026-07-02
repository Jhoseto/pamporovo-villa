import type { ReactNode } from "react";
import { useEffect } from "react";
import { destroyLenis, initLenis, startLenisRaf } from "@/lib/lenis";
import "lenis/dist/lenis.css";

type SmoothScrollProviderProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function SmoothScrollProvider({
  children,
  enabled = true,
}: SmoothScrollProviderProps) {
  useEffect(() => {
    if (!enabled) return;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void initLenis().then(lenis => {
      if (cancelled || !lenis) return;

      lenis.scrollTo(0, { immediate: true });
      const stopRaf = startLenisRaf(lenis);
      cleanup = () => {
        stopRaf();
        destroyLenis();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled]);

  return <>{children}</>;
}
