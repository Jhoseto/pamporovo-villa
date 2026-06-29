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

    const lenis = initLenis();
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });

    const stopRaf = startLenisRaf(lenis);

    return () => {
      stopRaf();
      destroyLenis();
    };
  }, [enabled]);

  return <>{children}</>;
}
