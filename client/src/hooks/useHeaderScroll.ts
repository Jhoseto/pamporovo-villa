import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";

export function useHeaderScroll(threshold = 48) {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const lenis = getLenis();
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      const next = scrollY > threshold;
      if (next === scrolledRef.current) return;
      scrolledRef.current = next;
      setScrolled(next);
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
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return scrolled;
}
