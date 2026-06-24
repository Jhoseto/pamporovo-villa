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

    const lenis = initLenis();
    if (!lenis) return;

    const stopRaf = startLenisRaf(lenis);

    return () => {
      stopRaf();
      destroyLenis();
    };
  }, [enabled]);

  return <>{children}</>;
}
