import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/data/siteContent";

const MIN_SPLASH_MS = 1200;
const EXIT_MS = 520;

export function useAdminSplashGate(isLoading: boolean) {
  const mountedAt = useRef(Date.now());
  const [phase, setPhase] = useState<"splash" | "exit" | "done">("splash");

  useEffect(() => {
    if (isLoading) return;

    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
    const timer = window.setTimeout(() => setPhase("exit"), wait);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (phase !== "exit") return;
    const timer = window.setTimeout(() => setPhase("done"), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return {
    showSplash: phase !== "done",
    exiting: phase === "exit",
  };
}

type AdminSplashScreenProps = {
  exiting?: boolean;
};

export function AdminSplashScreen({ exiting = false }: AdminSplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(100);
      return;
    }

    const duration = MIN_SPLASH_MS + 200;
    const start = performance.now();

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      setProgress(pct);
      if (now - start < duration) requestAnimationFrame(tick);
    };

    const rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      className="admin-splash fixed inset-0 z-[120] flex flex-col items-center justify-center px-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.02 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="admin-splash-glow pointer-events-none" aria-hidden />

      <motion.div
        className="admin-splash-logo-wrap relative"
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{ opacity: exiting ? 0.85 : 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={SITE.logo} alt={SITE.name} className="admin-splash-logo" width={1024} height={250} />
      </motion.div>

      <motion.p
        className="admin-splash-subtitle relative mt-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: exiting ? 0.7 : 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        Административен панел
      </motion.p>

      <motion.div
        className="admin-splash-progress relative mt-10"
        initial={{ opacity: 0, scaleX: 0.85 }}
        animate={{ opacity: exiting ? 0 : 1, scaleX: 1 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-splash-progress-fill" style={{ width: `${progress}%` }} />
      </motion.div>
    </motion.div>
  );
}
