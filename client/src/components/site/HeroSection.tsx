import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles, Tag } from "lucide-react";
import { useRef } from "react";
import { HERO_PHOTO, SITE } from "@/data/siteContent";
import { useOffersModal } from "@/contexts/OffersModalContext";
import { useSiteReady } from "@/contexts/SiteReadyContext";
import { scrollToSection } from "@/lib/scroll";
import { GoldenParticles } from "./GoldenParticles";
import { MagneticButton } from "./MagneticButton";
import { SplitText } from "./SplitText";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const siteReady = useSiteReady();
  const { openOffers } = useOffersModal();
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
      className="relative flex h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[var(--ink)]"
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

      {!reducedMotion && siteReady && (
        <>
          <motion.div
            className="glass-panel absolute left-[8%] top-[20%] hidden h-28 w-44 rounded-2xl border-white/10 md:block"
            initial={{ opacity: 0, x: -40, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="glass-panel absolute bottom-[25%] right-[6%] hidden h-36 w-52 rounded-2xl border-white/10 md:block"
            initial={{ opacity: 0, x: 40, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </>
      )}

      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center text-white"
        style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={entrance(0)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow mb-6 inline-flex items-center gap-2 text-[var(--gold)]">
            <Sparkles className="h-3.5 w-3.5" />
            Смолян · Пампорово · {SITE.tagline}
          </p>
        </motion.div>

        <h1 className="mb-8 font-serif text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
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
          className="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-white/85 md:text-xl"
          initial={entrance(0.35)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: siteReady ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          Три вили под наем в най-слънчевия планински курорт в България
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
          initial={entrance(0.5)}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: siteReady ? 1.05 : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagneticButton
            size="lg"
            className="premium-btn px-10 py-7 text-lg"
            onClick={() => scrollToSection("experience")}
          >
            Започни разходката
          </MagneticButton>
          <MagneticButton
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/5 px-10 py-7 text-lg text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            onClick={() => scrollToSection("booking")}
          >
            Резервирай
          </MagneticButton>
          <MagneticButton
            size="lg"
            variant="outline"
            className="border-[var(--gold)]/50 bg-[var(--gold)]/10 px-8 py-7 text-lg text-[var(--gold)] backdrop-blur-sm hover:bg-[var(--gold)]/20 hover:text-[var(--gold)]"
            onClick={openOffers}
          >
            <Tag className="mr-2 h-4 w-4" />
            Топ оферти
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToSection("experience")}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition hover:text-white md:bottom-10"
        initial={motionInitial}
        animate={{ opacity: 1 }}
        transition={{ delay: siteReady ? 1.4 : 0 }}
        aria-label="Продължи към разходката"
      >
        <span className="eyebrow text-[10px]">Скрол</span>
        <ChevronDown className="h-6 w-6 animate-bounce motion-reduce:animate-none" />
      </motion.button>
    </section>
  );
}
