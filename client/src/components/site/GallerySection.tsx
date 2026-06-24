import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GALLERY_IMAGES } from "@/data/siteContent";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function GallerySection() {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = GALLERY_IMAGES.length;
  const current = GALLERY_IMAGES[selected];

  const go = useCallback(
    (direction: number) => {
      setSelected(prev => (prev + direction + total) % total);
    },
    [total]
  );

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

  return (
    <>
      <SectionShell
        id="gallery"
        eyebrow="Галерия"
        title="Pamporovo Villa"
        subtitle="Разгледайте вилите, интериора и планинските гледки"
      >
        <ScrollReveal>
          <div className="floating-card mx-auto max-w-6xl overflow-hidden p-3 md:p-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative block w-full overflow-hidden rounded-2xl"
                aria-label="Отвори галерията на цял екран"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    className="aspect-[16/10] w-full object-cover md:aspect-[16/9]"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
                <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition group-hover:bg-black/50">
                  <Expand className="h-3.5 w-3.5" />
                  Цял екран
                </span>
                <p className="absolute bottom-4 left-4 max-w-md text-left text-sm text-white/90 md:text-base">
                  {current.alt}
                </p>
              </button>

              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60"
                aria-label="Предишно"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/60"
                aria-label="Следващо"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {GALLERY_IMAGES.map((image, idx) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setSelected(idx)}
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-xl border-2 transition",
                    idx === selected
                      ? "border-[var(--gold)] shadow-md shadow-[var(--gold)]/20"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                  aria-label={image.alt}
                  aria-current={idx === selected}
                >
                  <img
                    src={image.src}
                    alt=""
                    className="h-16 w-24 object-cover md:h-20 md:w-28"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </SectionShell>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 text-white"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white"
              aria-label="Предишно"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.alt}
              className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={e => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white"
              aria-label="Следващо"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <p className="absolute bottom-6 left-1/2 max-w-2xl -translate-x-1/2 text-center text-sm text-white/80">
              {current.alt} · {selected + 1}/{total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
