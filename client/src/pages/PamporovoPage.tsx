import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PamporovoHero } from "@/components/pamporovo/PamporovoHero";
import { PamporovoSectionNav } from "@/components/pamporovo/PamporovoSectionNav";

const PamporovoGuideContent = lazy(() =>
  import("@/components/pamporovo/PamporovoGuideContent").then(m => ({
    default: m.PamporovoGuideContent,
  }))
);

function GuideFallback() {
  return <div className="min-h-[40dvh] bg-[var(--cream)]" aria-hidden />;
}

export default function PamporovoPage() {
  return (
    <div className="relative min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main>
        <PamporovoHero />
        <PamporovoSectionNav />
        <Suspense fallback={<GuideFallback />}>
          <PamporovoGuideContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
