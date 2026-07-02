import { Images } from "lucide-react";
import { useCallback, useState, type CSSProperties } from "react";
import { VILLA_GALLERIES } from "@/data/galleryContent";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./GalleryLightbox";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";
import { VillaGalleryCarousel } from "./VillaGalleryCarousel";

export function GallerySection() {
  const [activeId, setActiveId] = useState(VILLA_GALLERIES[0]?.id ?? "villa-1");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [slideByVilla, setSlideByVilla] = useState<Record<string, number>>({});

  const active = VILLA_GALLERIES.find(g => g.id === activeId) ?? VILLA_GALLERIES[0];
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
      eyebrow="Галерия"
      title="Трите вили в кадри"
      subtitle="Разгледайте всяка вила — интериор, уют и планински гледки"
      overlap
      perfDefer
    >
      <ScrollReveal>
        <div className="mx-auto max-w-6xl">
          <div
            className="gallery-villa-picker mb-8 md:mb-10"
            role="tablist"
            aria-label="Избор на вила в галерията"
          >
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {VILLA_GALLERIES.map(gallery => {
                const isActive = gallery.id === activeId;
                return (
                  <button
                    key={gallery.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleVillaChange(gallery.id)}
                    className={cn(
                      "gallery-villa-card group relative overflow-hidden rounded-2xl text-left transition-[transform,box-shadow,opacity] duration-500 ease-out md:rounded-[1.35rem]",
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
                    <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3]">
                      <img
                        src={gallery.cover.src}
                        alt={gallery.cover.alt}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-black/10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

                      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                        <p className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/55 md:text-[0.68rem]">
                          {gallery.tagline}
                        </p>
                        <h3 className="mt-1 font-serif text-xl font-bold tracking-tight text-white md:text-2xl">
                          {gallery.name}
                        </h3>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70 md:text-sm">
                          <Images className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={1.75} />
                          {gallery.images.length} снимки
                        </p>
                      </div>

                      {isActive && (
                        <span
                          className="gallery-villa-card__ring pointer-events-none absolute inset-0 rounded-2xl md:rounded-[1.35rem]"
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
