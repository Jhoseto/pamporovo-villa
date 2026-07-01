import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";
import { HERO_PHOTO, SITE } from "@/data/siteContent";
import { useSiteReady } from "@/contexts/SiteReadyContext";
import { scrollToSection } from "@/lib/scroll";
import { GoldenParticles } from "./GoldenParticles";
import { HeroContactWidget, HeroGlassPanel, HeroWeatherWidget } from "./HeroGlassWidgets";
import { Button } from "@/components/ui/button";
import { SplitText } from "./SplitText";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const siteReady = useSiteReady();
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.72, 0.88]);

  const motionInitial = reducedMotion || !siteReady ? false : undefined;
  const entrance = (delay: number) =>
    reducedMotion || !siteReady
      ? { opacity: 1, y: 0, rotateX: 0 }
      : { opacity: 0, y: 30, rotateX: 0 };

  return (
    <section
      ref={ref}
      id="hero"
      className="hero-section relative flex w-full flex-col items-stretch justify-center overflow-hidden bg-[var(--ink)]"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reducedMotion ? undefined : { y: bgY }}
      >
        <picture className="block h-full w-full">
          <source srcSet={HERO_PHOTO.webpSrc} type="image/webp" />
          <img
            src={HERO_PHOTO.pngSrc}
            alt={HERO_PHOTO.alt}
            className="hero-photo h-full w-full object-cover object-center"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </picture>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-[var(--ink)]"
        style={reducedMotion ? undefined : { opacity: overlayOpacity }}
      />
      <div className="light-leak absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.55_0.15_50/0.25),transparent_50%)]" />
      <div className="ambient-grid absolute inset-0 opacity-40" />
      <GoldenParticles />
      <div className="film-grain pointer-events-none absolute inset-0" />

      {siteReady && (
        <>
          <motion.div
            className="hero-glass-float-left absolute left-[6%] top-[18%] z-[5] hidden w-[14.75rem] lg:block"
            initial={motionInitial ?? { opacity: 0, x: -40, rotateY: -12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroGlassPanel>
              <HeroWeatherWidget />
            </HeroGlassPanel>
          </motion.div>
          <motion.div
            className="hero-glass-float-right absolute bottom-[22%] right-[5%] z-[5] hidden w-[16.5rem] lg:block"
            initial={motionInitial ?? { opacity: 0, x: 40, rotateY: 12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroGlassPanel>
              <HeroContactWidget />
            </HeroGlassPanel>
          </motion.div>
        </>
      )}

      <motion.div
        className="hero-content relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-[max(1rem,env(safe-area-inset-left,0px))] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(5rem+env(safe-area-inset-top,0px))] text-center text-white sm:px-6 sm:pb-20 md:px-6 md:py-24"
        style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={entrance(0)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mx-auto mb-4 max-w-[16rem] text-[0.65rem] leading-relaxed text-[var(--gold)] sm:mb-6 sm:max-w-none sm:text-[0.7rem]">
            <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span>Смолян · Пампорово · {SITE.tagline}</span>
            </span>
          </p>
        </motion.div>

        <h1 className="mb-5 font-serif text-[2.15rem] font-bold leading-[1.08] tracking-tight sm:mb-8 sm:text-5xl md:text-7xl lg:text-8xl">
          {siteReady ? (
            <>
              <SplitText
                as="span"
                mode="word"
                text="Pamporovo"
                className="mb-2 block w-full justify-center text-white"
                delay={0.2}
              />
              <SplitText
                as="span"
                mode="char"
                text="Villa"
                className="block w-full justify-center text-[var(--gold)]"
                delay={0.55}
              />
            </>
          ) : (
            <>
              <span className="mb-2 block">Pamporovo</span>
              <span className="block text-[var(--gold)]">Villa</span>
            </>
          )}
        </h1>

        <motion.p
          className="hero-subtitle mx-auto mb-7 max-w-[20rem] text-[0.9375rem] font-light leading-relaxed text-white/85 sm:mb-10 sm:max-w-2xl sm:text-lg md:text-xl"
          initial={entrance(0.35)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: siteReady ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          Предлагаме ви три самостоятелни вили сред магическите гори на Пампорово. Домашен уют в планината, през цялата година.
        </motion.p>

        <motion.div
          className="hero-actions mx-auto flex w-full max-w-xs flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-nowrap sm:items-center sm:justify-center sm:gap-4"
          initial={entrance(0.5)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: siteReady ? 1.05 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            size="lg"
            className="premium-btn h-auto min-h-[2.875rem] w-full px-5 py-3.5 text-sm sm:w-auto sm:min-h-0 sm:px-10 sm:py-7 sm:text-lg"
            onClick={() => scrollToSection("experience")}
          >
            Започни разходката
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto min-h-[2.875rem] w-full border-white/30 bg-white/5 px-5 py-3.5 text-sm text-white backdrop-blur-sm hover:bg-white/10 hover:text-white sm:w-auto sm:min-h-0 sm:px-10 sm:py-7 sm:text-lg"
            onClick={() => scrollToSection("booking")}
          >
            Резервирай
          </Button>
        </motion.div>

        {siteReady && (
          <motion.div
            className="mx-auto mt-6 w-full max-w-sm lg:hidden"
            initial={entrance(0.62)}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: siteReady && !reducedMotion ? 1.15 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroGlassPanel>
              <HeroContactWidget />
            </HeroGlassPanel>
          </motion.div>
        )}
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToSection("experience")}
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/70 transition hover:text-white sm:flex md:bottom-10"
        initial={motionInitial}
        animate={{ opacity: 1 }}
        transition={{ delay: siteReady ? 1.4 : 0 }}
        aria-label="Продължи към разходката"
      >
        <span className="eyebrow text-[10px]">Надолу</span>
        <ChevronDown className="h-6 w-6 animate-bounce motion-reduce:animate-none" />
      </motion.button>
    </section>
  );
}
