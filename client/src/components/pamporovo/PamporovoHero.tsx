import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Mountain } from "lucide-react";
import { useEffect, useRef } from "react";
import { HERO_IMAGES, PAMPOROVO_PAGE_META } from "@/data/pamporovoContent";
import { MagneticButton } from "@/components/site/MagneticButton";
import { SplitText } from "@/components/site/SplitText";
import { Button } from "@/components/ui/button";
import { navigateToHomeSection } from "@/lib/siteNav";
import { useLocation } from "wouter";
import { usePageLang } from "@/hooks/usePageLang";
import { EN_SEO } from "@shared/seoEnMeta";
import { PAMPOROVO_HUB_EN } from "@shared/en/pamporovoHubEn";

export function PamporovoHero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [location, setLocation] = useLocation();
  const lang = usePageLang();
  const en = lang === "en";
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
    const pageTitle = en ? (EN_SEO["/pamporovo"]?.title ?? PAMPOROVO_HUB_EN.title) : PAMPOROVO_PAGE_META.title;
    const pageDescription = en
      ? (EN_SEO["/pamporovo"]?.description ?? PAMPOROVO_HUB_EN.description)
      : PAMPOROVO_PAGE_META.description;

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
  }, [en]);

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
          alt={en ? "Stenata ski run and Snezhanka peak — Pamporovo" : "Писта Стената и кулата Снежанка — Пампорово"}
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
          {en ? PAMPOROVO_HUB_EN.eyebrow : "Родопите · к.к. Пампорово"}
        </p>
        <h1 className="max-w-4xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
          <SplitText as="span" mode="word" text={en ? PAMPOROVO_HUB_EN.h1 : "Пампорово и околностите"} delay={0.08} />
        </h1>
        <p className="mt-6 max-w-2xl font-display text-lg leading-relaxed tracking-wide text-white/75 md:text-xl">
          {en ? PAMPOROVO_HUB_EN.subtitle : "Пълен гид за курорта и региона — 37+ км писти, лифтове, еко пътеки, пещери и автентични села на един планински ден пътуване от вилите."}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            className="premium-btn h-12 px-8"
            onClick={() => {
              document.getElementById("pamporovo-winter")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Mountain className="mr-2 h-4 w-4" />
            {en ? "Winter — pistes & lifts" : "Зима — писти и лифтове"}
          </MagneticButton>
          <Button
            variant="outline"
            className="h-12 border-white/25 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            onClick={() => {
              document.getElementById("pamporovo-summer")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {en ? "Summer — eco trails" : "Лято — еко маршрути"}
          </Button>
          <Button
            variant="ghost"
            className="h-12 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => navigateToHomeSection("booking", setLocation, location)}
          >
            {en ? PAMPOROVO_HUB_EN.bookCta : "Резервирай вила"}
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
