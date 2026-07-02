import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let wakeLenisRaf: (() => void) | null = null;

function isTouchOnlyDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return null;

  if (isTouchOnlyDevice()) return null;

  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    lerp: 0.1,
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Restart Lenis rAF — required before programmatic scrollTo when idle. */
export function wakeLenis() {
  wakeLenisRaf?.();
}

export function destroyLenis() {
  lenisInstance?.destroy();
  lenisInstance = null;
}

/** Runs Lenis rAF only while scroll velocity is active — saves CPU when idle. */
export function startLenisRaf(lenis: Lenis) {
  let rafId = 0;
  let active = true;

  const loop = (time: number) => {
    lenis.raf(time);
    if (!active) return;

    if (Math.abs(lenis.velocity) > 0.01) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = 0;
    }
  };

  const wake = () => {
    if (!rafId) rafId = requestAnimationFrame(loop);
  };

  wakeLenisRaf = wake;

  const unsubScroll = lenis.on("scroll", wake);
  window.addEventListener("wheel", wake, { passive: true });
  window.addEventListener("touchstart", wake, { passive: true });
  window.addEventListener("keydown", wake, { passive: true });

  wake();

  return () => {
    active = false;
    wakeLenisRaf = null;
    cancelAnimationFrame(rafId);
    unsubScroll();
    window.removeEventListener("wheel", wake);
    window.removeEventListener("touchstart", wake);
    window.removeEventListener("keydown", wake);
  };
}
