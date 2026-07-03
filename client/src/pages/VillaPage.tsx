import { Flame, MapPin, Phone } from "lucide-react";
import { useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { MagneticButton } from "@/components/site/MagneticButton";
import {
  CONTACT,
  formatPriceEur,
  getDeluxeSummerRate,
  getDeluxeWinterRate,
  PRICING_TIERS,
  VILLAS,
  VILLA_DELUXE_ID,
} from "@/data/siteContent";
import { getVillaGallery } from "@/data/galleryContent";
import { useTranslation } from "@/contexts/LocaleContext";
import {
  interpolate,
  useAmenities,
  useContactAddress,
  useVillaFeatures,
  useVillaPageConfigLocalized,
  useVillaPricingNotes,
} from "@/i18n/contentHooks";
import { navigateToHomeSection } from "@/lib/siteNav";
import { usePageLang } from "@/hooks/usePageLang";
import { useLocalizedNav } from "@/hooks/useLocalizedNav";
import { isVillaId, villaPath, VILLA_PAGE_CONFIGS } from "@shared/villaPages";
import NotFound from "./NotFound";

export default function VillaPage() {
  const { t } = useTranslation();
  const [, params] = useRoute("/villa/:id");
  const [location, setLocation] = useLocation();
  const lang = usePageLang();
  const { href, navigate, search } = useLocalizedNav();
  const villaId = params?.id ?? "";
  const config = useVillaPageConfigLocalized(villaId);
  const villa = VILLAS.find(v => v.id === villaId);
  const gallery = isVillaId(villaId) ? getVillaGallery(villaId) : undefined;
  const features = useVillaFeatures();
  const pricingNotes = useVillaPricingNotes();
  const amenities = useAmenities().slice(0, 5);
  const address = useContactAddress();

  const description = isVillaId(villaId)
    ? t(`villa.pages.${villaId}.description`, villa?.description ?? "")
    : (villa?.description ?? "");

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

  const villaName = t(`villa.pages.${villaId}.name`, villa.name);
  const otherVillas = VILLA_PAGE_CONFIGS.filter(v => v.id !== villaId);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <SiteHeader />
      <main id="main-content" className="container mx-auto max-w-3xl px-4 pb-20 pt-28 md:pt-32">
        <LangSwitcher className="mb-4" />

        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href={href("/rent")} className="hover:text-[var(--gold)]">
            {t("villa.backToRent", "← Наем на вила")}
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
          {features.map(feature => (
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
            {interpolate(t("villa.pricingHeadingFor", "Цени за {villa}"), { villa: villaName })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("villa.wholeVillaNote", "Цяла вила · до 6 гости")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--cream)]/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("villa.summerFrom", "Лято от")}
              </p>
              <p className="font-serif text-2xl font-bold text-[var(--gold)]">
                {formatPriceEur(summerFrom)} {t("villa.pricingPerNight", "/ нощ")}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--cream)]/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("villa.winterFrom", "Зима от")}
              </p>
              <p className="font-serif text-2xl font-bold text-[var(--gold)]">
                {formatPriceEur(winterFrom)} {t("villa.pricingPerNight", "/ нощ")}
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {pricingNotes.map(note => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">
            {t("villa.amenitiesHeading", "Удобства")}
          </h2>
          <ul className="mt-4 space-y-3">
            {amenities.map(a => (
              <li key={a.title} className="text-sm text-muted-foreground">
                <strong className="text-foreground">{a.title}</strong> — {a.description}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--gold)]" />
            {address}
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
            onClick={() => navigateToHomeSection("booking", setLocation, location, search)}
          >
            {interpolate(t("villa.bookVilla", "Резервирай {villa}"), { villa: villaName })}
          </MagneticButton>
          <MagneticButton
            variant="outline"
            className="h-12 px-8"
            onClick={() => navigate("/pamporovo")}
          >
            {t("villa.guideLink", "Гид Пампорово")}
          </MagneticButton>
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold">
            {t("villa.otherVillas", "Другите ни вили")}
          </h2>
          <ul className="mt-4 space-y-2">
            {otherVillas.map(v => (
              <li key={v.id}>
                <Link
                  href={href(villaPath(v.id))}
                  className="block rounded-xl border border-black/8 bg-white px-4 py-3 text-sm hover:border-[var(--gold)]/40"
                >
                  {t(`villa.pages.${v.id}.h1`, v.h1)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
