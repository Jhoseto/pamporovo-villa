import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Mountain } from "lucide-react";
import { useEffect, useRef } from "react";
import { HERO_IMAGES } from "@/data/pamporovoContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { MagneticButton } from "@/components/site/MagneticButton";
import { SplitText } from "@/components/site/SplitText";
import { Button } from "@/components/ui/button";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import { navigateToHomeSection } from "@/lib/siteNav";
import { useLocation } from "wouter";

export function PamporovoHero() {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [location, setLocation] = useLocation();
  const { search } = useLocalizedNav();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const defaultTitle = document.title;
    const descEl = document.querySelector('meta[name="description"]');
    const prevDescription = descEl?.getAttribute("content") ?? "";
    const pageTitle = t("hub.title", "Пампорово и Родопите — пълен гид | Pamporovo Villa");
    const pageDescription = t(
      "hub.description",
      "Всичко за курорта Пампорово: 37+ км ски писти, лифтове, нощно каране, еко пътеки, пещери и забележителности около Смолян — зима и лято."
    );

    document.title = pageTitle;
    if (descEl) descEl.setAttribute("content", pageDescription);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const prevOgTitle = ogTitle?.getAttribute("content") ?? "";
    const prevOgDesc = ogDesc?.getAttribute("content") ?? "";
    ogTitle?.setAttribute("content", pageTitle);
    ogDesc?.setAttribute("content", pageDescription);

    return () => {
      document.title = defaultTitle;
      if (descEl && prevDescription) descEl.setAttribute("content", prevDescription);
      if (prevOgTitle) ogTitle?.setAttribute("content", prevOgTitle);
      if (prevOgDesc) ogDesc?.setAttribute("content", prevOgDesc);
    };
  }, [t]);

  return (
    <section
      ref={ref}
      id="pamporovo-hero"
      className="relative flex min-h-[92dvh] w-full items-end overflow-hidden bg-[var(--ink)] pb-16 pt-28 md:min-h-[100dvh] md:pb-24 md:pt-32"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reducedMotion ? undefined : { y: bgY }}
      >
        <img
          src={HERO_IMAGES.winter}
          alt={t("hub.heroAlt", "Писта Стената и кулата Снежанка — Пампорово")}
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-[var(--ink)]" />
      <div className="ambient-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--ink)] to-transparent" />

      <motion.div
        className="container relative z-[1] mx-auto px-4"
        style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <p className="eyebrow mb-4 text-[var(--gold)]">
          {t("hub.eyebrow", "Родопите · к.к. Пампорово")}
        </p>
        <h1 className="max-w-4xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
          <SplitText as="span" mode="word" text={t("hub.h1", "Пампорово и околностите")} delay={0.08} />
        </h1>
        <p className="mt-6 max-w-2xl font-display text-lg leading-relaxed tracking-wide text-white/75 md:text-xl">
          {t(
            "hub.subtitle",
            "Пълен гид за курорта и региона — 37+ км писти, лифтове, еко пътеки, пещери и автентични села на един планински ден пътуване от вилите."
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            className="premium-btn h-12 px-8"
            onClick={() => {
              document.getElementById("pamporovo-winter")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Mountain className="mr-2 h-4 w-4" />
            {t("hub.winterCta", "Зима — писти и лифтове")}
          </MagneticButton>
          <Button
            variant="outline"
            className="h-12 border-white/25 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            onClick={() => {
              document.getElementById("pamporovo-summer")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t("hub.summerCta", "Лято — еко маршрути")}
          </Button>
          <Button
            variant="ghost"
            className="h-12 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
          >
            {t("hub.bookCta", "Резервирай вила")}
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-[1] -translate-x-1/2 text-white/50"
        animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
