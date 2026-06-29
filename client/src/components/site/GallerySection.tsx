import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_IMAGES } from "@/data/siteContent";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function GallerySection() {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [lightbox, setLightbox] = useState(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const skipInitialThumbScroll = useRef(true);
  const touchStartX = useRef<number | null>(null);

  const total = GALLERY_IMAGES.length;
  const current = GALLERY_IMAGES[selected];
  const indexLabel = String(selected + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const progress = ((selected + 1) / total) * 100;

  const go = useCallback(
    (step: number) => {
      if (step === 0) return;
      setDirection(step > 0 ? 1 : -1);
      setSelected(prev => (prev + step + total) % total);
    },
    [total]
  );

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
    const next = GALLERY_IMAGES[(selected + 1) % total];
    const prev = GALLERY_IMAGES[(selected - 1 + total) % total];
    for (const image of [next, prev]) {
      const preload = new Image();
      preload.src = image.src;
    }
  }, [selected, total]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

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

  return (
    <>
      <SectionShell
        id="gallery"
        eyebrow="Галерия"
        title="Нашето предложение в кадри"
        subtitle="Интериор, уют и планински гледки"
        overlap
      >
        <ScrollReveal>
          <div className="mx-auto max-w-6xl">
            <div
              className="gallery-frame relative overflow-hidden rounded-3xl shadow-[0_32px_80px_-28px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative block w-full touch-pan-y"
                aria-label="Отвори галерията на цял екран"
              >
                <img
                  key={selected}
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
                    onClick={() => setLightbox(true)}
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
                aria-label="Миниатюри в галерията"
              >
                {GALLERY_IMAGES.map((image, idx) => (
                  <button
                    key={image.src}
                    ref={el => {
                      thumbRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    onClick={() => {
                      setDirection(idx > selected ? 1 : -1);
                      setSelected(idx);
                    }}
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
          </div>
        </ScrollReveal>
      </SectionShell>

      {lightbox && (
        <div
          className="gallery-lightbox fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Галерия на цял екран"
          onClick={() => setLightbox(false)}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.14_75/0.08),transparent_55%)]" />

          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="gallery-nav-btn absolute right-4 top-4 z-10 h-11 w-11 rounded-full"
            aria-label="Затвори"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              go(-1);
            }}
            className="gallery-nav-btn absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full"
            aria-label="Предишно"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            key={`lb-${selected}`}
            src={current.src}
            alt={current.alt}
            className={cn(
              "gallery-lightbox-img relative z-[1] max-h-[88vh] max-w-[92vw] object-contain",
              direction > 0 ? "gallery-enter-next" : "gallery-enter-prev"
            )}
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              go(1);
            }}
            className="gallery-nav-btn absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full"
            aria-label="Следващо"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="font-display absolute bottom-6 left-1/2 z-[1] max-w-2xl -translate-x-1/2 text-center text-base tracking-wide text-white/90 md:text-lg">
            {current.alt}
            <span className="mt-1 block text-sm text-[var(--gold)]">
              {indexLabel} / {totalLabel}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
