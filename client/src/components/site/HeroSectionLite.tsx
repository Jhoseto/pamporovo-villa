import { Sparkles } from "lucide-react";
import { HERO_PHOTO } from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { scrollToSection } from "@/lib/scroll";
import { HeroContactWidget, HeroGlassPanel } from "./HeroGlassWidgets";
import { Button } from "@/components/ui/button";

/** Mobile critical path — same layout, no framer-motion. Upgraded after preloader. */
export function HeroSectionLite() {
  const { t } = useTranslation();

  return (
    <section
      id="hero"
      className="hero-section relative flex w-full flex-col items-stretch justify-center overflow-hidden bg-[var(--ink)]"
    >
      <div className="absolute inset-0">
        <picture className="block h-full w-full">
          <source media="(max-width: 767px)" srcSet={HERO_PHOTO.mobileWebpSrc} type="image/webp" />
          <source srcSet={HERO_PHOTO.webpSrc} type="image/webp" />
          <img
            src={HERO_PHOTO.src}
            alt={HERO_PHOTO.alt}
            width={1024}
            height={768}
            className="hero-photo h-full w-full object-cover object-center"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            onLoad={() => {
              if (typeof window.__pvHideLcpShell === "function") {
                window.__pvHideLcpShell();
              }
            }}
          />
        </picture>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-[var(--ink)]" />
      <div className="light-leak absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.55_0.15_50/0.25),transparent_50%)]" />
      <div className="ambient-grid absolute inset-0 opacity-40" />

      <div className="hero-content relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-[max(1rem,env(safe-area-inset-left,0px))] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(5rem+env(safe-area-inset-top,0px))] text-center text-white sm:px-6 sm:pb-20 md:px-6 md:py-24">
        <p className="eyebrow mx-auto mb-4 max-w-[16rem] text-[0.65rem] leading-relaxed text-[var(--gold)] sm:mb-6 sm:max-w-none sm:text-[0.7rem]">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span>{t("home.hero.eyebrow", "България · Смолян · Пампорово · 3 вили под наем")}</span>
          </span>
        </p>

        <h1 className="mb-5 font-serif text-[2.15rem] font-bold leading-[1.08] tracking-tight sm:mb-8 sm:text-5xl md:text-7xl lg:text-8xl">
          <span className="mb-2 block">{t("home.hero.titleLine1", "Pamporovo")}</span>
          <span className="block text-[var(--gold)]">{t("home.hero.titleLine2", "Villa")}</span>
        </h1>

        <p className="hero-subtitle mx-auto mb-7 max-w-[20rem] text-[0.9375rem] font-light leading-relaxed text-white/85 sm:mb-10 sm:max-w-2xl sm:text-lg md:text-xl">
          {t("home.hero.subtitle", "Предлагаме ви три самостоятелни вили сред магическите гори на Пампорово. Домашен уют в планината, през цялата година.")}
        </p>

        <div className="hero-actions mx-auto flex w-full max-w-xs flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-nowrap sm:items-center sm:justify-center sm:gap-4">
          <Button
            size="lg"
            className="premium-btn h-auto min-h-[2.875rem] w-full px-5 py-3.5 text-sm sm:w-auto sm:min-h-0 sm:px-10 sm:py-7 sm:text-lg"
            onClick={() => scrollToSection("experience")}
          >
            {t("home.hero.ctaExperience", "Започни разходката")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto min-h-[2.875rem] w-full border-white/30 bg-white/5 px-5 py-3.5 text-sm text-white backdrop-blur-sm hover:bg-white/10 hover:text-white sm:w-auto sm:min-h-0 sm:px-10 sm:py-7 sm:text-lg"
            onClick={() => scrollToSection("booking")}
          >
            {t("home.hero.ctaBook", "Резервация")}
          </Button>
        </div>

        <div className="mx-auto mt-6 w-full max-w-sm lg:hidden">
          <HeroGlassPanel>
            <HeroContactWidget />
          </HeroGlassPanel>
        </div>
      </div>
    </section>
  );
}
