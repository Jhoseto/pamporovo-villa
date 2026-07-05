import { Phone, MapPin, Home } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { MagneticButton } from "@/components/site/MagneticButton";
import {
  CONTACT,
  formatPriceEur,
  PRICING_TIERS,
  SITE,
} from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import {
  interpolate,
  useContactAddress,
  useDistances,
  usePricingNotes,
  useVillaFeatures,
  useVillasLocalized,
} from "@/i18n/contentHooks";
import { usePageLang } from "@/hooks/usePageLang";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import { navigateToHomeSection } from "@/lib/siteNav";
import { trackRentPageView } from "@/lib/analytics/events";
import { villaPath, isVillaId } from "@shared/villaPages";

export default function RentPage() {
  const { t } = useTranslation();
  const lang = usePageLang();
  const [location, setLocation] = useLocation();
  const { href, navigate, search } = useLocalizedNav();
  const villas = useVillasLocalized();
  const features = useVillaFeatures();
  const distances = useDistances();
  const pricingNotes = usePricingNotes();
  const address = useContactAddress();
  const minPrice = PRICING_TIERS[PRICING_TIERS.length - 1]?.summerPerNight ?? 110;

  useEffect(() => {
    document.title = t("seo.routes./rent.title", "Наем на вила в Пампорово | 3 вили от 110 €/нощ — Pamporovo Villa");
    trackRentPageView(lang);
  }, [lang, t]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main id="main-content" className="container mx-auto max-w-3xl px-4 pb-20 pt-28 md:pt-32">
        <LangSwitcher className="mb-4" />

        <p className="eyebrow mb-3 text-[var(--gold)]">
          {t("rent.eyebrow", "Официален наем · Pamporovo Villa")}
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {t("rent.h1", "Наем на вила в Пампорово")}
        </h1>
        <p className="mt-4 font-display text-lg leading-relaxed text-muted-foreground">
          {t(
            "rent.intro",
            "Три самостоятелни вили на Райковски ливади — наемате цялата вила само за вашата група. Всяка с 2 спални, 1 баня, камина, BBQ, до 6 гости."
          )}
        </p>

        <section className="mt-10 rounded-2xl border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-xl font-semibold">
            {t("rent.villasHeading", "Трите вили")}
          </h2>
          <ul className="mt-4 space-y-4">
            {villas.map(villa => (
              <li
                key={villa.id}
                className="rounded-xl border border-black/6 bg-[var(--cream)]/60 p-4"
              >
                <p className="font-serif text-lg font-semibold">{villa.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{villa.tagline}</p>
                <p className="mt-2 text-sm leading-relaxed">{villa.description}</p>
                {isVillaId(villa.id) && (
                  <Link
                    href={href(villaPath(villa.id))}
                    className="mt-3 inline-block text-sm font-medium text-[var(--gold)] hover:underline"
                  >
                    {interpolate(
                      t("rent.villaPageLink", "{villa} страница →"),
                      { villa: villa.name }
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {features.map(feature => (
            <div
              key={feature}
              className="flex gap-3 rounded-xl border border-black/6 bg-white p-4 text-sm"
            >
              <Home className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
              <span>{feature}</span>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--gold)]/25 bg-white p-6 md:p-8">
          <h2 className="font-serif text-xl font-semibold">
            {t("rent.pricingHeading", "Цени")}
          </h2>
          <p className="mt-2 font-serif text-2xl font-bold text-[var(--gold)]">
            {t("rent.pricingFrom", "от")} {formatPriceEur(minPrice)}{" "}
            {t("rent.pricingPerNight", "/ нощ")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("rent.pricingNote", "Цяла вила · до 6 гости · зима и лято")}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {pricingNotes.map(note => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-3 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" />
            {address}
          </p>
          {distances.slice(0, 2).map(d => (
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
            onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
          >
            {t("rent.bookOnline", "Резервирайте онлайн")}
          </MagneticButton>
          <MagneticButton
            variant="outline"
            className="h-12 px-8"
            onClick={() => navigate("/pamporovo")}
          >
            {t("rent.guideLink", "Пълен гид за Пампорово")}
          </MagneticButton>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t("rent.footerNote", "Официален сайт за наем на вила в Пампорово, България")}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
