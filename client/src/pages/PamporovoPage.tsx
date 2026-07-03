import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { PamporovoHero } from "@/components/pamporovo/PamporovoHero";
import { PamporovoSectionNav } from "@/components/pamporovo/PamporovoSectionNav";
import { PamporovoFaqSection } from "@/components/pamporovo/PamporovoFaqSection";
import { spokePath } from "@shared/pamporovoSpokes";
import { useTranslation } from "@/contexts/LocaleContext";
import { useAllSpokesLocalized } from "@/i18n/contentHooks";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
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
  const { t } = useTranslation();
  const { href } = useLocalizedNav();
  const spokes = useAllSpokesLocalized();

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
              {t("hub.usefulPages", "Полезни страници")}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {spokes.map(spoke => (
                <li key={spoke.slug}>
                  <Link
                    href={href(spokePath(spoke.slug))}
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
