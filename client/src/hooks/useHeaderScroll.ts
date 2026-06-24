import { useEffect, useState } from "react";
import { getLenis } from "@/lib/lenis";

export function useHeaderScroll(threshold = 48) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const lenis = getLenis();
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      setScrolled(scrollY > threshold);
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", update);
      update();
      return () => {
        lenis.off("scroll", update);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}
