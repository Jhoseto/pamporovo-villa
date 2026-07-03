import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { MagneticButton } from "@/components/site/MagneticButton";
import { PamporovoFaqSection } from "@/components/pamporovo/PamporovoFaqSection";
import { PamporovoSpokeStickyCta } from "@/components/pamporovo/PamporovoSpokeStickyCta";
import { PisteTable, AttractionCard, LiftTable } from "@/components/pamporovo/PamporovoCards";
import { useGuideAttractionById, useGuideLiftFacts, useGuidePistes } from "@/i18n/guideHooks";
import { formatPriceEur, PRICING_TIERS } from "@/data/siteContent";
import { navigateToHomeSection } from "@/lib/siteNav";
import { useTranslation } from "@/contexts/LocaleContext";
import { useSpokeContent } from "@/i18n/contentHooks";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import {
  PAMPOROVO_SPOKES,
  spokePath,
  type PamporovoSpokeSlug,
} from "@shared/pamporovoSpokes";
import NotFound from "./NotFound";

function VillaCtaBlock() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { navigate, search } = useLocalizedNav();
  const minPrice = PRICING_TIERS[PRICING_TIERS.length - 1]?.summerPerNight ?? 110;

  return (
    <section className="mt-10 rounded-2xl border border-[var(--gold)]/30 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-semibold">
        {t("hub.villaCtaTitle", "Pamporovo Villa — наем на вила")}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t("hub.villaCtaBody", "3 самостоятелни вили на Райковски ливади · 2 km от центъра · камина · BBQ · до 6 гости")}
      </p>
      <p className="mt-3 font-serif text-2xl font-bold text-[var(--gold)]">
        {t("hub.villaCtaFrom", "от")} {formatPriceEur(minPrice)} {t("hub.villaCtaPerNight", "/ нощ")}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <MagneticButton
          className="premium-btn h-11 px-6"
          onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
        >
          {t("common.book", "Резервирай")}
        </MagneticButton>
        <MagneticButton variant="outline" className="h-11 px-6" onClick={() => navigate("/rent")}>
          {t("hub.seeRent", "Виж /rent")}
        </MagneticButton>
      </div>
    </section>
  );
}

function RelatedSpokes({ slugs }: { slugs: PamporovoSpokeSlug[] }) {
  const { t } = useTranslation();
  const related = slugs
    .map(slug => PAMPOROVO_SPOKES.find(s => s.slug === slug))
    .filter(Boolean);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-serif text-xl font-semibold">
        {t("hub.moreOnTopic", "Още по темата")}
      </h2>
      <ul className="mt-4 space-y-2">
        {related.map(bg => (
          <RelatedSpokeLink key={bg!.slug} slug={bg!.slug} />
        ))}
      </ul>
    </section>
  );
}

function RelatedSpokeLink({ slug }: { slug: PamporovoSpokeSlug }) {
  const spoke = useSpokeContent(slug);
  const { href } = useLocalizedNav();
  if (!spoke) return null;
  return (
    <li>
      <Link
        href={href(spokePath(slug))}
        className="group flex items-center justify-between rounded-xl border border-black/8 bg-white px-4 py-3 text-sm transition-colors hover:border-[var(--gold)]/40"
      >
        <span>{spoke.h1}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

function LocalizedAttractionCard({ id }: { id: string }) {
  const attraction = useGuideAttractionById(id);
  if (!attraction) return null;
  return <AttractionCard item={attraction} />;
}

export default function PamporovoSpokePage() {
  const { t } = useTranslation();
  const pistes = useGuidePistes();
  const liftFacts = useGuideLiftFacts();
  const [, params] = useRoute("/pamporovo/:slug");
  const [location, setLocation] = useLocation();
  const { href, navigate, search } = useLocalizedNav();
  const slug = (params?.slug ?? "") as PamporovoSpokeSlug;
  const spoke = useSpokeContent(slug);

  useEffect(() => {
    if (!spoke) return;
    document.title = spoke.seoTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", spoke.seoDescription);
  }, [spoke]);

  if (!spoke) return <NotFound />;

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-24 md:pb-20">
      <SiteHeader />
      <main id="main-content" className="container mx-auto max-w-3xl px-4 pb-12 pt-28 md:pt-32">
        <LangSwitcher className="mb-4" />

        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href={href("/pamporovo")} className="inline-flex items-center gap-1 hover:text-[var(--gold)]">
            <ArrowLeft className="h-4 w-4" />
            {t("hub.backToGuide", "Пълен гид за Пампорово")}
          </Link>
        </nav>

        <p className="eyebrow mb-3 text-[var(--gold)]">{spoke.eyebrow}</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">{spoke.h1}</h1>
        <p className="mt-4 font-display text-lg leading-relaxed text-muted-foreground">{spoke.intro}</p>

        {spoke.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-serif text-xl font-semibold">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            {section.bullets && (
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {section.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-[var(--gold)]">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {spoke.showPisteTable && (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-semibold">{t("hub.pisteTable", "Таблица с писти")}</h2>
            <div className="mt-4">
              <PisteTable pistes={pistes} />
            </div>
          </section>
        )}

        {spoke.showLiftTable && (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-semibold">{t("hub.liftTable", "Ски лифтове в Пампорово")}</h2>
            <div className="mt-4">
              <LiftTable lifts={liftFacts} />
            </div>
          </section>
        )}

        {spoke.featuredAttractionIds && spoke.featuredAttractionIds.length > 0 && (
          <section className="mt-10 space-y-6">
            <h2 className="font-serif text-xl font-semibold">{t("hub.recommendedNearby", "Препоръчано наблизо")}</h2>
            {spoke.featuredAttractionIds.map((id) => (
              <LocalizedAttractionCard key={id} id={id} />
            ))}
          </section>
        )}

        {spoke.emphasizeVillaCta && <VillaCtaBlock />}

        <RelatedSpokes slugs={spoke.relatedSlugs} />

        <PamporovoFaqSection
          tags={spoke.faqTags}
          title={t("hub.questionsTopic", "Въпроси по темата")}
          limit={8}
          className="mt-14"
        />

        <div className="mt-10 hidden flex-wrap gap-4 md:flex">
          <MagneticButton
            className="premium-btn h-12 px-8"
            onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
          >
            {t("hub.bookVilla", "Резервирай вила")}
          </MagneticButton>
          <MagneticButton variant="outline" className="h-12 px-8" onClick={() => navigate("/rent")}>
            {t("hub.rentPage", "Страница за наем")}
          </MagneticButton>
        </div>
      </main>
      <PamporovoSpokeStickyCta />
      <SiteFooter />
    </div>
  );
}
