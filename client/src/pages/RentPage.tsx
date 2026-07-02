import { Phone, MapPin, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { MagneticButton } from "@/components/site/MagneticButton";
import {
  CONTACT,
  DISTANCES,
  formatPriceEur,
  PRICING_NOTES,
  PRICING_TIERS,
  SITE,
  VILLAS,
  VILLA_FEATURES,
} from "@/data/siteContent";
import { navigateToHomeSection } from "@/lib/siteNav";
import { trackRentPageView } from "@/lib/analytics/events";
import { villaPath, isVillaId } from "@shared/villaPages";
import { parseSeoLang } from "@shared/seoEnMeta";
import { RENT_PAGE_EN } from "@shared/rentPageEn";
import { EN_SEO } from "@shared/seoEnMeta";

const RENT_PAGE_TITLE_BG =
  "Наем на вила в Пампорово | 3 вили от 110 €/нощ — Pamporovo Villa";

export default function RentPage() {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState(() =>
    typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);

  const lang = parseSeoLang(search);
  const en = lang === "en";
  const copy = en ? RENT_PAGE_EN : null;
  const minPrice = PRICING_TIERS[PRICING_TIERS.length - 1]?.summerPerNight ?? 110;

  useEffect(() => {
    document.title = en
      ? (EN_SEO["/rent"]?.title ?? RENT_PAGE_EN.title)
      : RENT_PAGE_TITLE_BG;
    trackRentPageView(lang);
  }, [en, lang]);

  const pricingNotes = en ? RENT_PAGE_EN.pricingNotes : PRICING_NOTES;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 pb-20 pt-28 md:pt-32">
        <LangSwitcher className="mb-4" />

        <p className="eyebrow mb-3 text-[var(--gold)]">
          {copy?.eyebrow ?? "Официален наем · Pamporovo Villa"}
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {copy?.h1 ?? "Наем на вила в Пампорово"}
        </h1>
        <p className="mt-4 font-display text-lg leading-relaxed text-muted-foreground">
          {en ? (
            copy!.intro
          ) : (
            <>
              Три самостоятелни вили на{" "}
              <strong className="text-foreground">Райковски ливади</strong> — наемате цялата вила
              само за вашата компания. Всяка с 2 спални, 2 бани, камина, барbecue и до 6 гости.
            </>
          )}
        </p>

        <section className="mt-10 rounded-2xl border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-xl font-semibold">
            {copy?.villasHeading ?? "Трите вили"}
          </h2>
          <ul className="mt-4 space-y-4">
            {VILLAS.map((villa) => (
              <li
                key={villa.id}
                className="rounded-xl border border-black/6 bg-[var(--cream)]/60 p-4"
              >
                <p className="font-serif text-lg font-semibold">{en ? villa.nameEn : villa.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{villa.tagline}</p>
                {!en && <p className="mt-2 text-sm leading-relaxed">{villa.description}</p>}
                {isVillaId(villa.id) && (
                  <Link
                    href={en ? `${villaPath(villa.id)}?lang=en` : villaPath(villa.id)}
                    className="mt-3 inline-block text-sm font-medium text-[var(--gold)] hover:underline"
                  >
                    {en
                      ? copy!.villaPageLink(villa.nameEn)
                      : `Страница на ${villa.name} →`}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {!en && (
          <section className="mt-8 grid gap-3 sm:grid-cols-2">
            {VILLA_FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex gap-3 rounded-xl border border-black/6 bg-white p-4 text-sm"
              >
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <span>{feature}</span>
              </div>
            ))}
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-[var(--gold)]/25 bg-white p-6 md:p-8">
          <h2 className="font-serif text-xl font-semibold">{copy?.pricingHeading ?? "Цени"}</h2>
          <p className="mt-2 font-serif text-2xl font-bold text-[var(--gold)]">
            {copy?.pricingFrom ?? "от"} {formatPriceEur(minPrice)} {copy?.pricingPerNight ?? "/ нощ"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy?.pricingNote ?? "За цяла вила · до 6 гости · зимен и летен сезон"}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {pricingNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" />
            {CONTACT.address}
          </p>
          {DISTANCES.slice(0, 2).map((d) => (
            <p key={d.label} className="text-muted-foreground">
              {d.value} {d.label}
            </p>
          ))}
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[var(--gold)]" />
            <a href={`tel:${CONTACT.phone}`} className="hover:text-[var(--gold)]">
              {CONTACT.phoneDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${SITE.email}`} className="hover:text-[var(--gold)]">
              {SITE.email}
            </a>
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            className="premium-btn h-12 px-8"
            onClick={() => navigateToHomeSection("booking", setLocation, location)}
          >
            {copy?.bookOnline ?? "Резервирай онлайн"}
          </MagneticButton>
          <MagneticButton
            variant="outline"
            className="h-12 px-8"
            onClick={() => setLocation("/pamporovo")}
          >
            {copy?.guideLink ?? "Гид за Пампорово"}
          </MagneticButton>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {copy?.footerNote ?? `${SITE.websiteLabel} · официален сайт за наем на вили в Пампорово`}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
