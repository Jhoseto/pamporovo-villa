import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SITE } from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";

type PreloaderProps = {
  onComplete: () => void;
};

export function Preloader({ onComplete }: PreloaderProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.style.overflow = "hidden";

    if (window.matchMedia("(max-width: 767px)").matches) {
      const hero = new Image();
      hero.src = "/photos/hero-mobile.webp";
      hero.fetchPriority = "high";
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
      setProgress(100);
      setVisible(false);
      document.body.style.overflow = "";
      onComplete();
      return;
    }

    const duration = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        setVisible(false);
        document.body.style.overflow = "";
        onComplete();
      }
    };

    const rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--ink)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ambient-grid absolute inset-0 opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.15_50/0.15),transparent_60%)]" />

          <motion.img
            src={SITE.logo}
            alt={SITE.name}
            width={1024}
            height={250}
            className="preloader-logo relative w-auto md:h-20"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.p
            className="preloader-tagline eyebrow relative mt-4 text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {t("common.tagline", SITE.tagline)} · {t("common.location", SITE.location)}
          </motion.p>

          <div className="preloader-progress relative mt-12 h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--gold)]/50 via-[var(--gold)] to-[var(--gold)]/50 transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
