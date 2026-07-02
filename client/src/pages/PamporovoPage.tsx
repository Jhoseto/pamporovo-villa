import { lazy, Suspense, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { PamporovoHero } from "@/components/pamporovo/PamporovoHero";
import { PamporovoSectionNav } from "@/components/pamporovo/PamporovoSectionNav";
import { PamporovoFaqSection } from "@/components/pamporovo/PamporovoFaqSection";
import { PAMPOROVO_SPOKES, spokePath } from "@shared/pamporovoSpokes";
import { localizeSpoke } from "@shared/en/localizeSpoke";
import { PAMPOROVO_HUB_EN } from "@shared/en/pamporovoHubEn";
import { EN_UI } from "@shared/en/commonUi";
import { EN_SEO } from "@shared/seoEnMeta";
import { usePageLang } from "@/hooks/usePageLang";
import { withLang } from "@/lib/localizedNav";
import { Link } from "wouter";

const PamporovoGuideContent = lazy(() =>
  import("@/components/pamporovo/PamporovoGuideContent").then(m => ({
    default: m.PamporovoGuideContent,
  }))
);

function GuideFallback() {
  return <div className="min-h-[40dvh] bg-[var(--cream)]" aria-hidden />;
}

export default function PamporovoPage() {
  const lang = usePageLang();
  const en = lang === "en";

  const spokes = useMemo(
    () => PAMPOROVO_SPOKES.map((s) => localizeSpoke(s, lang)),
    [lang]
  );

  useEffect(() => {
    if (!en) return;
    document.title = EN_SEO["/pamporovo"]?.title ?? PAMPOROVO_HUB_EN.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", EN_SEO["/pamporovo"]?.description ?? PAMPOROVO_HUB_EN.description);
  }, [en]);

  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main id="main-content">
        <PamporovoHero />
        <PamporovoSectionNav />
        <Suspense fallback={<GuideFallback />}>
          <PamporovoGuideContent />
        </Suspense>
        <div className="container mx-auto max-w-3xl px-4 pb-16">
          <LangSwitcher className="mb-6" />
          <section className="mt-8 border-t border-black/8 pt-12">
            <h2 className="font-serif text-2xl font-semibold">
              {en ? EN_UI.usefulPages : "Полезни страници"}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {spokes.map((spoke) => (
                <li key={spoke.slug}>
                  <Link
                    href={withLang(spokePath(spoke.slug), lang)}
                    className="block rounded-xl border border-black/8 bg-white px-4 py-3 text-sm transition-colors hover:border-[var(--gold)]/40"
                  >
                    {spoke.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <PamporovoFaqSection
            tags={["general", "ski", "sleep", "summer", "practical"]}
            limit={12}
            className="mt-8 border-t border-black/8 pt-12"
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
