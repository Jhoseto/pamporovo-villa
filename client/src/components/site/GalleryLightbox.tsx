import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { VillaGallery } from "@/data/galleryContent";
import { cn } from "@/lib/utils";

type Props = {
  galleries: VillaGallery[];
  activeId: string;
  onActiveIdChange: (id: string) => void;
  selected: number;
  onSelectedChange: (index: number, direction: 1 | -1) => void;
  direction: 1 | -1;
  onClose: () => void;
};

export function GalleryLightbox({
  galleries,
  activeId,
  onActiveIdChange,
  selected,
  onSelectedChange,
  direction,
  onClose,
}: Props) {
  const active = galleries.find(g => g.id === activeId) ?? galleries[0];
  const images = active?.images ?? [];
  const total = images.length;
  const current = images[selected] ?? images[0];
  const indexLabel = String(selected + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  const go = useCallback(
    (step: number) => {
      if (step === 0 || total === 0) return;
      onSelectedChange((selected + step + total) % total, step > 0 ? 1 : -1);
    },
    [total, selected, onSelectedChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, go]);

  useEffect(() => {
    if (total === 0) return;
    const next = images[(selected + 1) % total];
    const prev = images[(selected - 1 + total) % total];
    for (const image of [next, prev]) {
      const preload = new Image();
      preload.src = image.src;
    }
  }, [selected, total, images]);

  if (!current || !active) return null;

  return createPortal(
    <div
      className="gallery-lightbox fixed inset-0 z-[200] flex h-[100dvh] w-full flex-col bg-black/94 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Галерия на цял екран"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.14_75/0.08),transparent_55%)]"
        aria-hidden
      />

      <header className="relative z-20 flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 md:pt-6">
        <div
          className="gallery-lightbox-villas flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 md:gap-2"
          role="tablist"
          aria-label="Избор на вила"
        >
          {galleries.map(gallery => {
            const isActive = gallery.id === activeId;
            return (
              <button
                key={gallery.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onActiveIdChange(gallery.id)}
                className={cn(
                  "gallery-lightbox-villa-tab shrink-0 rounded-full border px-3 py-1.5 font-display text-xs tracking-wide transition-all duration-300 md:px-4 md:py-2 md:text-sm",
                  isActive
                    ? "gallery-lightbox-villa-tab--active border-[var(--gold)]/50 bg-[var(--gold)]/15 text-white"
                    : "border-white/12 bg-white/5 text-white/55 hover:border-white/25 hover:bg-white/10 hover:text-white/85"
                )}
              >
                {gallery.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="gallery-nav-btn h-11 w-11 shrink-0 rounded-full"
          aria-label="Затвори"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-14 py-4 md:px-24 md:py-6">
        <button
          type="button"
          onClick={() => go(-1)}
          className="gallery-nav-btn absolute left-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full md:left-6"
          aria-label="Предишно"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <img
          key={`lb-${activeId}-${selected}`}
          src={current.src}
          alt={current.alt}
          className={cn(
            "gallery-lightbox-img max-h-[calc(100dvh-13rem)] max-w-[min(92vw,72rem)] object-contain",
            direction > 0 ? "gallery-enter-next" : "gallery-enter-prev"
          )}
        />

        <button
          type="button"
          onClick={() => go(1)}
          className="gallery-nav-btn absolute right-3 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full md:right-6"
          aria-label="Следващо"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <footer className="relative z-10 shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 text-center">
        <p className="font-display text-sm tracking-wide text-white/90 md:text-base">
          <span className="mb-0.5 block text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold)] md:text-xs">
            {active.name} · {active.tagline}
          </span>
          {current.alt}
          <span className="mt-1 block text-xs text-white/55 md:text-sm">
            {indexLabel} / {totalLabel}
          </span>
        </p>
      </footer>
    </div>,
    document.body
  );
}
