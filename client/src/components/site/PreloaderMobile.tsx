import { useEffect, useState } from "react";
import { SITE } from "@/data/siteContent";

type PreloaderMobileProps = {
  onComplete: () => void;
};

/** Mobile-only preloader — identical look, pure CSS (no framer-motion). */
export function PreloaderMobile({ onComplete }: PreloaderMobileProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.style.overflow = "hidden";

    const heroReady = new Promise<void>(resolve => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = "/photos/hero-mobile.webp";
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let done = false;
    let rafId = 0;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(rafId);
      window.scrollTo(0, 0);
      setExiting(true);
      window.setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
        onComplete();
      }, 900);
    };

    if (prefersReducedMotion) {
      void heroReady.then(finish);
      return () => {
        document.body.style.overflow = "";
      };
    }

    const duration = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        void heroReady.then(finish);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      done = true;
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`preloader-mobile fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--ink)]${exiting ? " preloader-mobile--exit" : ""}`}
      aria-busy={!exiting}
      aria-label="Зареждане"
    >
      <div className="ambient-grid absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.15_50/0.15),transparent_60%)]" />

      <img
        src={SITE.logo}
        alt={SITE.name}
        width={1024}
        height={250}
        className="preloader-logo preloader-mobile-logo relative w-auto"
        decoding="async"
      />

      <p className="preloader-tagline preloader-mobile-tagline eyebrow relative mt-4 text-white/40">
        {SITE.tagline} · {SITE.location}
      </p>

      <div className="preloader-progress relative mt-12 h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)]/50 via-[var(--gold)] to-[var(--gold)]/50 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
