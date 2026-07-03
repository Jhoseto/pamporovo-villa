import { useEffect, useState } from "react";
import { useSearchParams } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LegalDocumentView } from "@/components/legal/LegalBlocks";
import { useLegalDocument, useLegalMeta, useLegalTabs } from "@/i18n/legalHooks";

type Tab = "privacy" | "terms" | "cookies";

export default function LegalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = (searchParams.get("tab") as Tab | null) ?? "privacy";
  const tabs = useLegalTabs();
  const meta = useLegalMeta();
  const [active, setActive] = useState<Tab>(
    tabs.some((t) => t.id === initial) ? initial : "privacy"
  );

  const privacy = useLegalDocument("privacy");
  const terms = useLegalDocument("terms");
  const cookies = useLegalDocument("cookies");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    document.title = meta.pageTitle;
    return () => {
      document.title = meta.controllerName;
    };
  }, [meta.pageTitle, meta.controllerName]);

  useEffect(() => {
    setActive(tabs.some((t) => t.id === initial) ? initial : "privacy");
  }, [initial, tabs]);

  const setActiveTab = (tab: Tab) => {
    setActive(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  const current = tabs.find((t) => t.id === active)!;
  const activeDocument =
    active === "privacy" ? privacy : active === "terms" ? terms : cookies;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />

      <div className="bg-[var(--ink)] pb-0 pt-28 md:pt-32">
        <div className="container mx-auto px-4 pb-0">
          <p className="mb-2 font-display text-xs tracking-[0.2em] text-[var(--gold)] uppercase">
            {meta.heroEyebrow}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
            {current.label}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
            {meta.controllerName} · {meta.siteUrl}
          </p>

          <div className="mt-8 flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "legal-tab whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors",
                  active === tab.id
                    ? "border-b-2 border-[var(--gold)] text-[var(--gold)]"
                    : "border-b-2 border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
                aria-selected={active === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 text-sm text-[oklch(0.52_0.02_65)]">
            {meta.lastUpdatedLabel} {meta.lastUpdated}
          </p>
          <LegalDocumentView sections={activeDocument.sections} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
