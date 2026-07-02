import { Flame, MapPin, Phone } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { MagneticButton } from "@/components/site/MagneticButton";
import {
  AMENITIES,
  CONTACT,
  formatPriceEur,
  getDeluxeSummerRate,
  getDeluxeWinterRate,
  PRICING_NOTES,
  PRICING_TIERS,
  VILLA_FEATURES,
  VILLAS,
  VILLA_DELUXE_ID,
} from "@/data/siteContent";
import { getVillaGallery } from "@/data/galleryContent";
import { navigateToHomeSection } from "@/lib/siteNav";
import { usePageLang } from "@/hooks/usePageLang";
import { withLang } from "@/lib/localizedNav";
import { EN_UI } from "@shared/en/commonUi";
import { getVillaPageEn } from "@shared/en/villaPagesEn";
import { getVillaPageConfig, isVillaId, villaPath, VILLA_PAGE_CONFIGS } from "@shared/villaPages";
import NotFound from "./NotFound";

const VILLA_FEATURES_EN = [
  "2 bedrooms · 2 bathrooms",
  "Wood fireplace in living room",
  "BBQ veranda",
  "Fully equipped kitchen",
  "Wi‑Fi and free parking",
  "Up to 6 guests — whole villa",
] as const;

const PRICING_NOTES_EN = [
  "Prices are for the whole villa, not per person",
  "Resort fee included",
  "Firewood €10/bag on request",
  "Lift passes not included",
] as const;

export default function VillaPage() {
  const [, params] = useRoute("/villa/:id");
  const [location, setLocation] = useLocation();
  const lang = usePageLang();
  const en = lang === "en";
  const villaId = params?.id ?? "";
  const bgConfig = getVillaPageConfig(villaId);
  const villa = VILLAS.find((v) => v.id === villaId);
  const gallery = isVillaId(villaId) ? getVillaGallery(villaId) : undefined;

  const config = useMemo(() => {
    if (!bgConfig || !isVillaId(villaId)) return bgConfig;
    const enCopy = getVillaPageEn(villaId);
    if (!en || !enCopy) return bgConfig;
    return { ...bgConfig, ...enCopy };
  }, [bgConfig, en, villaId]);

  const description = useMemo(() => {
    if (!isVillaId(villaId)) return villa?.description ?? "";
    if (en) return getVillaPageEn(villaId)?.description ?? villa?.description ?? "";
    return villa?.description ?? "";
  }, [en, villa, villaId]);

  const baseTier = PRICING_TIERS[PRICING_TIERS.length - 1];
  const summerFrom =
    villaId === VILLA_DELUXE_ID
      ? getDeluxeSummerRate(baseTier?.summerPerNight ?? 110)
      : (baseTier?.summerPerNight ?? 110);
  const winterFrom =
    villaId === VILLA_DELUXE_ID
      ? getDeluxeWinterRate(baseTier?.winterPerNight ?? 120)
      : (baseTier?.winterPerNight ?? 120);

  useEffect(() => {
    if (!config) return;
    document.title = config.seoTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", config.seoDescription);
  }, [config]);

  if (!config || !villa) return <NotFound />;

  const otherVillas = VILLA_PAGE_CONFIGS.filter((v) => v.id !== villaId);
  const features = en ? VILLA_FEATURES_EN : VILLA_FEATURES;
  const pricingNotes = en ? PRICING_NOTES_EN : PRICING_NOTES;
  const villaName = en ? villa.nameEn : villa.name;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl px-4 pb-20 pt-28 md:pt-32">
        <LangSwitcher className="mb-4" />

        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href={withLang("/rent", lang)} className="hover:text-[var(--gold)]">
            {en ? `← ${EN_UI.rentPage}` : "← Наем на вила"}
          </Link>
        </nav>

        {gallery && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-black/8 shadow-sm">
            <img
              src={gallery.cover.src}
              alt={gallery.cover.alt}
              className="aspect-[16/10] w-full object-cover"
              fetchPriority="high"
            />
          </div>
        )}

        <p className="eyebrow mb-3 text-[var(--gold)]">{config.tagline}</p>
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">{config.h1}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex gap-3 rounded-xl border border-black/6 bg-white p-4 text-sm"
            >
              <Flame className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
              <span>{feature}</span>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--gold)]/25 bg-white p-6 md:p-8">
          <h2 className="font-serif text-xl font-semibold">
            {en ? `${EN_UI.pricing} — ${villaName}` : `Цени за ${villa.name}`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {en ? EN_UI.wholeVillaNote : "За цяла вила · до 6 гости"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--cream)]/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {en ? EN_UI.summerFrom : "Лято от"}
              </p>
              <p className="font-serif text-2xl font-bold text-[var(--gold)]">
                {formatPriceEur(summerFrom)} {en ? EN_UI.perNight : "/ нощ"}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--cream)]/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {en ? EN_UI.winterFrom : "Зима от"}
              </p>
              <p className="font-serif text-2xl font-bold text-[var(--gold)]">
                {formatPriceEur(winterFrom)} {en ? EN_UI.perNight : "/ нощ"}
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {pricingNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">{en ? EN_UI.amenities : "Удобства"}</h2>
          <ul className="mt-4 space-y-3">
            {AMENITIES.slice(0, 5).map((a) => (
              <li key={a.title} className="text-sm text-muted-foreground">
                <strong className="text-foreground">{a.title}</strong> — {a.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" />
            {CONTACT.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[var(--gold)]" />
            <a href={`tel:${CONTACT.phone}`} className="hover:text-[var(--gold)]">
              {CONTACT.phoneDisplay}
            </a>
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <MagneticButton
            className="premium-btn h-12 px-8"
            onClick={() => navigateToHomeSection("booking", setLocation, location)}
          >
            {en ? `${EN_UI.book} ${villaName}` : `Резервирай ${villa.name}`}
          </MagneticButton>
          <MagneticButton variant="outline" className="h-12 px-8" onClick={() => setLocation(withLang("/pamporovo", lang))}>
            {en ? EN_UI.fullGuide : "Гид Пампорово"}
          </MagneticButton>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold">{en ? EN_UI.otherVillas : "Другите вили"}</h2>
          <ul className="mt-4 space-y-2">
            {otherVillas.map((v) => {
              const label = en ? getVillaPageEn(v.id)?.h1 ?? v.h1 : v.h1;
              return (
                <li key={v.id}>
                  <Link
                    href={withLang(villaPath(v.id), lang)}
                    className="block rounded-xl border border-black/8 bg-white px-4 py-3 text-sm hover:border-[var(--gold)]/40"
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
