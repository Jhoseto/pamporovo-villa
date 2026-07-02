import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SitePhoto } from "@/data/siteContent";
import { cn } from "@/lib/utils";

type Props = {
  images: SitePhoto[];
  villaName: string;
  galleryKey: string;
  selected: number;
  direction: 1 | -1;
  onSelectedChange: (index: number, direction: 1 | -1) => void;
  onOpenLightbox: () => void;
};

export function VillaGalleryCarousel({
  images,
  villaName,
  galleryKey,
  selected,
  direction,
  onSelectedChange,
  onOpenLightbox,
}: Props) {
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const skipInitialThumbScroll = useRef(true);
  const touchStartX = useRef<number | null>(null);

  const total = images.length;
  const current = images[selected] ?? images[0];
  const indexLabel = String(selected + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const progress = total > 0 ? ((selected + 1) / total) * 100 : 0;

  useEffect(() => {
    skipInitialThumbScroll.current = true;
  }, [galleryKey]);

  const go = (step: number) => {
    if (step === 0 || total === 0) return;
    onSelectedChange((selected + step + total) % total, step > 0 ? 1 : -1);
  };

  useEffect(() => {
    const thumb = thumbRefs.current[selected];
    const strip = thumbStripRef.current;
    if (!thumb || !strip) return;

    if (skipInitialThumbScroll.current) {
      skipInitialThumbScroll.current = false;
      return;
    }

    const targetLeft = thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
    strip.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [selected]);

  useEffect(() => {
    if (total === 0) return;
    const next = images[(selected + 1) % total];
    const prev = images[(selected - 1 + total) % total];
    for (const image of [next, prev]) {
      const preload = new Image();
      preload.src = image.src;
    }
  }, [selected, total, images]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta === undefined || Math.abs(delta) < 48) return;
    go(delta < 0 ? 1 : -1);
  };

  if (!current) return null;

  return (
    <>
      <div
        className="gallery-frame relative overflow-hidden rounded-3xl shadow-[0_32px_80px_-28px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onOpenLightbox}
          className="group relative block w-full touch-pan-y"
          aria-label={`Отвори галерията на ${villaName} на цял екран`}
        >
          <img
            key={`${galleryKey}-${selected}`}
            src={current.src}
            alt={current.alt}
            className={cn(
              "gallery-hero-img aspect-[16/10] w-full object-cover md:aspect-[2/1]",
              direction > 0 ? "gallery-enter-next" : "gallery-enter-prev"
            )}
            loading={selected === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={selected === 0 ? "high" : "auto"}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
          <div className="pointer-events-none absolute left-5 top-5 z-10 md:left-6 md:top-6">
            <p className="font-display text-[0.65rem] uppercase tracking-[0.28em] text-white/55 md:text-xs">
              {villaName}
            </p>
          </div>
        </button>

        <div className="gallery-progress-track pointer-events-none" aria-hidden>
          <div className="gallery-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="gallery-carousel-dock pointer-events-none absolute inset-x-3 bottom-3 z-20 md:inset-x-5 md:bottom-5">
          <div className="gallery-carousel-bar pointer-events-auto">
            <button
              type="button"
              onClick={() => go(-1)}
              className="gallery-carousel-btn"
              aria-label="Предишно"
            >
              <ChevronLeft className="h-4 w-4 md:h-[1.125rem] md:w-[1.125rem]" />
            </button>

            <div className="gallery-carousel-meta min-w-0 flex-1 px-1 md:px-2">
              <p className="font-display text-sm tracking-[0.18em] text-white md:text-base">
                <span className="text-[var(--gold)]">{indexLabel}</span>
                <span className="mx-1.5 text-white/35">/</span>
                {totalLabel}
              </p>
              <p className="truncate font-display text-xs tracking-wide text-white/75 md:text-sm">
                {current.alt}
              </p>
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              className="gallery-carousel-btn"
              aria-label="Следващо"
            >
              <ChevronRight className="h-4 w-4 md:h-[1.125rem] md:w-[1.125rem]" />
            </button>

            <span className="gallery-carousel-divider" aria-hidden />

            <button
              type="button"
              onClick={onOpenLightbox}
              className="gallery-carousel-btn gallery-carousel-btn--expand"
              aria-label="Цял екран"
            >
              <Expand className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="gallery-thumb-wrap relative mt-5 md:mt-6">
        <div
          ref={thumbStripRef}
          className="gallery-thumb-strip flex gap-2.5 overflow-x-auto pb-2 md:gap-3"
          role="tablist"
          aria-label={`Миниатюри — ${villaName}`}
        >
          {images.map((image, idx) => (
            <button
              key={image.src}
              ref={el => {
                thumbRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              onClick={() => onSelectedChange(idx, idx > selected ? 1 : -1)}
              className={cn(
                "gallery-thumb relative shrink-0 overflow-hidden rounded-lg border border-transparent",
                idx === selected ? "is-active" : "opacity-45 hover:opacity-80"
              )}
              aria-label={image.alt}
              aria-selected={idx === selected}
              aria-current={idx === selected ? "true" : undefined}
            >
              <img
                src={image.src}
                alt=""
                className="h-16 w-24 object-cover md:h-[4.75rem] md:w-[6.5rem]"
                loading="lazy"
                decoding="async"
              />
              {idx === selected && <span className="gallery-thumb-glow" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
