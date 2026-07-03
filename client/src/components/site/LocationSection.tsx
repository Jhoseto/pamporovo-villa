import { ExternalLink, MapPin, Navigation, Star } from "lucide-react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GBP } from "@shared/gbpLinks";
import { CONTACT, DISTANCES, PROPERTY_LOCATION } from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { useContactAddress, useHomeDistances } from "@/i18n/contentHooks";
import { MapView } from "@/components/Map";
import { trackGoogleReviewClick } from "@/lib/analytics/events";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function LocationSection() {
  const { t } = useTranslation();
  const address = useContactAddress();
  const distances = useHomeDistances();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapReady = useInView(mapRef, { once: true, margin: "200px 0px" });

  return (
    <SectionShell
      eyebrow={t("home.location.eyebrow", "Локация")}
      title={t("home.location.title", "На крачка от всичко, далеч от шума")}
      subtitle={t("home.location.subtitle", "к.к. Пампорово, местност Райковски ливади — сгушени в боровата гора")}
      overlap
      perfDefer
    >
      <ScrollReveal className="mb-10">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-foreground/75">
          {t("home.location.info", "Пампорово е най-слънчевият планински курорт в България — на 1 650 м в сърцето на Родопите. Зимата носи 37 км перфектно поддържани писти и нощно каране, а лятото — еко пътеки, водопади и въздух, който лекува. А нашите вили са вашата тиха база сред всичко това.")}
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <div
          ref={mapRef}
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/50 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.15)]"
        >
          <div className="relative">
            {mapReady ? (
              <MapView
                variant="premium"
                className="w-full"
                initialCenter={{ lat: PROPERTY_LOCATION.lat, lng: PROPERTY_LOCATION.lng }}
                initialZoom={PROPERTY_LOCATION.zoom}
                mapTitle={PROPERTY_LOCATION.label}
              />
            ) : (
              <div
                className="location-map-embed location-map-canvas flex h-[420px] w-full items-center justify-center bg-[var(--cream)] md:h-[520px]"
                aria-hidden
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)]/30 border-t-[var(--gold)]" />
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-6 pt-14 md:p-8 md:pt-16">
              <div className="pointer-events-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-md">
                  <p className="eyebrow mb-2 text-[var(--gold)]">Pamporovo Villa</p>
                  <p className="font-serif text-xl font-bold text-white md:text-2xl">
                    {PROPERTY_LOCATION.label}
                  </p>
                  <p className="mt-2 font-display text-sm leading-relaxed tracking-wide text-white/80 md:text-base">
                    {address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 self-start sm:flex-row sm:self-auto">
                  <a
                    href={PROPERTY_LOCATION.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-btn inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3.5 text-sm"
                  >
                    <Navigation className="h-4 w-4" />
                    {t("home.location.directions", "Навигирай до нас")}
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                  <a
                    href={GBP.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackGoogleReviewClick("location_map")}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-sm text-white backdrop-blur-sm transition hover:border-[var(--gold)]/50 hover:bg-white/15"
                  >
                    <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                    {t("gbp.reviewShort", "Google отзив")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={120} className="mt-8 md:mt-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {distances.map(item => (
            <div
              key={item.label}
              className="floating-card flex flex-col items-center p-5 text-center md:p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10">
                <MapPin className="h-4 w-4 text-[var(--gold)]" />
              </div>
              <p className="font-serif text-2xl font-bold text-foreground md:text-3xl">{item.value}</p>
              <p className="eyebrow mt-2 text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
