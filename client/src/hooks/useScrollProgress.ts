import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";

/** Lightweight page scroll progress (0–1) — rAF-throttled, no layout-heavy framer useScroll. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const lenis = getLenis();
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (Math.abs(next - progressRef.current) < 0.002) return;
      progressRef.current = next;
      setProgress(next);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", schedule);
      update();
      return () => {
        lenis.off("scroll", schedule);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return progress;
}
