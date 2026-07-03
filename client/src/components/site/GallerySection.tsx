import { Images } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { VILLA_GALLERIES } from "@/data/galleryContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { interpolate } from "@/i18n/contentHooks";
import { isMobileViewport } from "@/lib/mobilePerf";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./GalleryLightbox";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";
import { VillaGalleryCarousel } from "./VillaGalleryCarousel";

export function GallerySection() {
  const { t } = useTranslation();
  const villaLabel = (id: string, fallback: string) => t(`villa.pages.${id}.name`, fallback);
  const villaTagline = (id: string, fallback: string) => t(`villa.pages.${id}.tagline`, fallback);
  const [activeId, setActiveId] = useState(VILLA_GALLERIES[0]?.id ?? "villa-1");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [slideByVilla, setSlideByVilla] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = VILLA_GALLERIES.find(g => g.id === activeId) ?? VILLA_GALLERIES[0];
  const activeTabId = active
    ? isMobile
      ? `gallery-tab-${active.id}`
      : `gallery-tab-${active.id}-desktop`
    : undefined;
  const rawSelected = slideByVilla[activeId] ?? 0;
  const selected = active
    ? Math.min(rawSelected, Math.max(0, active.images.length - 1))
    : 0;

  const handleSelectedChange = useCallback(
    (index: number, dir: 1 | -1) => {
      setDirection(dir);
      setSlideByVilla(prev => ({ ...prev, [activeId]: index }));
    },
    [activeId]
  );

  const handleVillaChange = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <SectionShell
      eyebrow={t("home.gallery.eyebrow", "Галерия")}
      title={t("home.gallery.title", "Трите вили в кадри")}
      subtitle={t("home.gallery.subtitle", "Разгледайте всяка вила — интериор, уют и планински гледки")}
      overlap
      perfDefer
    >
      <ScrollReveal>
        <div className="mx-auto max-w-6xl">
          <div className="gallery-villa-picker mb-5 md:mb-10">
            {/* Mobile — compact pills so it's clear they filter the gallery below */}
            <div
              className="flex flex-col items-center gap-2 md:hidden"
              role="tablist"
              aria-label={t("home.widgets.galleryVillaTabs", "Избор на вила в галерията")}
            >
              <p className="font-display text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {t("home.gallery.pickVilla", "Изберете вила")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {VILLA_GALLERIES.map(gallery => {
                  const isActive = gallery.id === activeId;
                  return (
                    <button
                      key={gallery.id}
                      type="button"
                      role="tab"
                      id={`gallery-tab-${gallery.id}`}
                      aria-selected={isActive}
                      aria-controls={`gallery-panel-${gallery.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleVillaChange(gallery.id)}
                      className={cn(
                        "gallery-villa-pill shrink-0 rounded-full border px-3.5 py-1.5 font-display text-xs tracking-wide transition-all duration-300",
                        isActive
                          ? "gallery-villa-pill--active"
                          : "border-black/10 bg-white/80 text-foreground/75 hover:border-[var(--gold)]/35 hover:text-foreground"
                      )}
                    >
                      {villaLabel(gallery.id, gallery.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop — image cards (unchanged) */}
            <div
              className="hidden gap-4 sm:grid-cols-3 md:grid"
              role="tablist"
              aria-label={t("home.widgets.galleryVillaTabs", "Избор на вила в галерията")}
            >
              {VILLA_GALLERIES.map(gallery => {
                const isActive = gallery.id === activeId;
                return (
                  <button
                    key={gallery.id}
                    type="button"
                    role="tab"
                    id={`gallery-tab-${gallery.id}-desktop`}
                    aria-selected={isActive}
                    aria-controls={`gallery-panel-${gallery.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleVillaChange(gallery.id)}
                    className={cn(
                      "gallery-villa-card group relative overflow-hidden rounded-[1.35rem] text-left transition-[transform,box-shadow,opacity] duration-500 ease-out",
                      isActive
                        ? "gallery-villa-card--active z-[1] scale-[1.02] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.35)]"
                        : "opacity-[0.72] hover:opacity-100 hover:scale-[1.01]"
                    )}
                    style={
                      isActive
                        ? ({ "--gallery-accent": gallery.accent } as CSSProperties)
                        : undefined
                    }
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={gallery.cover.src}
                        alt={gallery.cover.alt}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-black/10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="font-display text-[0.68rem] uppercase tracking-[0.26em] text-white/55">
                          {villaTagline(gallery.id, gallery.tagline)}
                        </p>
                        <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">
                          {villaLabel(gallery.id, gallery.name)}
                        </h3>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/70">
                          <Images className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={1.75} />
                          {interpolate(t("home.gallery.photoCount", "{count} снимки"), {
                            count: String(gallery.images.length),
                          })}
                        </p>
                      </div>

                      {isActive && (
                        <span
                          className="gallery-villa-card__ring pointer-events-none absolute inset-0 rounded-[1.35rem]"
                          aria-hidden
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            key={active?.id}
            id={active ? `gallery-panel-${active.id}` : undefined}
            role="tabpanel"
            aria-labelledby={activeTabId}
            className="gallery-villa-view animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
          >
            {active && (
              <VillaGalleryCarousel
                images={active.images}
                villaName={active.name}
                galleryKey={active.id}
                selected={selected}
                direction={direction}
                onSelectedChange={handleSelectedChange}
                onOpenLightbox={() => setLightboxOpen(true)}
              />
            )}
          </div>
        </div>
      </ScrollReveal>

      {lightboxOpen && (
        <GalleryLightbox
          galleries={VILLA_GALLERIES}
          activeId={activeId}
          onActiveIdChange={handleVillaChange}
          selected={selected}
          onSelectedChange={handleSelectedChange}
          direction={direction}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </SectionShell>
  );
}
