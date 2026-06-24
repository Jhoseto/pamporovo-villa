import { useEffect, useState } from "react";

export function useParallax(speed = 0.4) {
  const [offset, setOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);

    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", onMotionChange);

    const onScroll = () => {
      if (media.matches) {
        setOffset(0);
        return;
      }
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      media.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  return { offset, reducedMotion };
}
