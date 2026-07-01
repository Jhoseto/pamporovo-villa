import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EXPERIENCE_PANELS, type ExperiencePanel } from "@/data/experiencePanels";
import { skipExperienceTour } from "@/lib/scroll";
import { cn } from "@/lib/utils";

// ─── Mobile detection (stable, read once at module level) ───────────────────

const IS_MOBILE =
  typeof window !== "undefined" &&
  (window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches);

// ─── Mobile: native horizontal swipe carousel ────────────────────────────────

function MobileExperienceCard({ panel, index }: { panel: ExperiencePanel; index: number }) {
  return (
    <div
      className="mobile-exp-card relative flex-none"
      style={{ scrollSnapAlign: "start", width: "100vw", height: "100%" }}
    >
      <img
        src={panel.image}
        alt={panel.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 80%, ${panel.accent}, transparent 55%)`,
        }}
      />

      {/* Room eyebrow */}
      <div className="absolute left-4 top-5 right-4">
        <p className="eyebrow text-[var(--gold)] text-[0.62rem]">{panel.room}</p>
      </div>

      {/* Bottom content — solid bg instead of backdrop-filter */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-6">
        <div className="mobile-exp-info-panel rounded-2xl p-5">
          <h2 className="font-serif text-2xl font-bold text-white leading-snug">{panel.title}</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            {panel.subtitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">{panel.description}</p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {panel.highlights.map(item => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: panel.accent }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileScrollPanelExperience() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = EXPERIENCE_PANELS.length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(0, idx), total - 1));
  }, [total]);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const prev = () => scrollTo(Math.max(0, activeIndex - 1));
  const next = () => scrollTo(Math.min(total - 1, activeIndex + 1));

  return (
    <section id="experience" className="relative bg-[var(--ink)]" aria-label="Виртуална разходка">
      {/* Header */}
      <div className="px-5 pb-3 pt-8 text-center">
        <p className="eyebrow text-[var(--gold)] text-[0.62rem]">Виртуална разходка</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-white">
          Влезте, преди да сте дошли
        </h2>
      </div>

      {/* Carousel */}
      <div className="relative" style={{ height: "72dvh" }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {EXPERIENCE_PANELS.map((panel, i) => (
            <MobileExperienceCard key={panel.id} panel={panel} index={i} />
          ))}
        </div>

        {/* Prev / Next arrows */}
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Предишен панел"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {activeIndex < total - 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Следващ панел"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 py-4">
        {EXPERIENCE_PANELS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Панел ${i + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeIndex
                ? "h-2 w-6 bg-[var(--gold)]"
                : "h-2 w-2 bg-white/25"
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="pb-6 text-center text-xs text-white/40">
        {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </section>
  );
}

// ─── Desktop: 3D sticky scroll (unchanged) ───────────────────────────────────

function PanelLayer({
  panel,
  index,
  total,
  scrollYProgress,
}: {
  panel: ExperiencePanel;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const segment = 1 / total;
  const start = index * segment;
  const end = (index + 1) * segment;
  const enter = start + segment * 0.12;
  const exit = end - segment * 0.12;

  const opacity = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    [0, 1, 1, index === total - 1 ? 1 : 0]
  );

  const scale = useTransform(scrollYProgress, [start, enter, exit, end], [0.78, 1, 1, 0.88]);

  const rotateX = useTransform(scrollYProgress, [start, enter, exit, end], [18, 0, 0, -14]);

  const rotateY = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    [index % 2 === 0 ? -6 : 6, 0, 0, index % 2 === 0 ? 4 : -4]
  );

  const y = useTransform(scrollYProgress, [start, enter, exit, end], [120, 0, 0, -90]);

  const panelScale = useTransform(scrollYProgress, [start, end], [1.12, 1]);

  const sidePanelX = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    [index % 2 === 0 ? 80 : -80, 0, 0, index % 2 === 0 ? -40 : 40]
  );

  const depthPanelZ = useTransform(scrollYProgress, [start, enter], [-180, 0]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-4 md:px-8"
      style={{ opacity, zIndex: total - index }}
    >
      <motion.div
        className="panel-3d relative h-[82vh] w-full max-w-7xl"
        style={{
          scale,
          rotateX,
          rotateY,
          y,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Background depth layer */}
        <motion.div
          className="pointer-events-none absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/[0.03]"
          style={{ translateZ: depthPanelZ, rotateZ: index % 2 === 0 ? -2 : 2 }}
        />

        {/* Main image panel */}
        <div className="relative h-full rounded-[1.75rem] border border-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 overflow-hidden rounded-[1.75rem]">
            <motion.img
              src={panel.image}
              alt={panel.imageAlt}
              className="h-full w-full object-cover"
              style={{ scale: panelScale }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-black/20" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-soft-light"
              style={{
                background: `radial-gradient(ellipse at 20% 80%, ${panel.accent}, transparent 55%)`,
              }}
            />

            {/* Info panel — bottom */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <div className="glass-panel max-w-3xl p-6 md:p-8">
                <p className="eyebrow mb-3 text-[var(--gold)]">{panel.room}</p>
                <h2 className="mb-2 font-serif text-3xl font-bold text-white md:text-5xl">
                  {panel.title}
                </h2>
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-white/70">
                  {panel.subtitle}
                </p>
                <p className="max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
                  {panel.description}
                </p>
              </div>
            </div>
          </div>

          {/* Side panel — highlights (desktop only) */}
          <motion.div
            className={cn(
              "glass-panel absolute top-1/4 z-10 hidden w-64 -translate-y-1/2 p-5 md:block lg:w-72",
              index % 2 === 0 ? "-right-8 lg:-right-14" : "-left-8 lg:-left-14"
            )}
            style={{ x: sidePanelX, translateZ: 60 }}
          >
            <p className="eyebrow mb-4 text-[var(--gold)]">Акценти</p>
            <ul className="space-y-3">
              {panel.highlights.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/90"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: panel.accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScrollProgress({
  scrollYProgress,
  total,
  activeIndex,
}: {
  scrollYProgress: MotionValue<number>;
  total: number;
  activeIndex: number;
}) {
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      <div className="relative h-48 w-px bg-white/20">
        <motion.div className="absolute left-0 top-0 w-full origin-top bg-[var(--gold)]" style={{ height: width }} />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-500",
              i === activeIndex ? "scale-150 bg-[var(--gold)]" : "bg-white/30"
            )}
          />
        ))}
      </div>
      <span className="eyebrow mt-2 text-[10px] text-white/70">
        {String(activeIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function SkipTourButton({
  direction,
  className,
}: {
  direction: "up" | "down";
  className?: string;
}) {
  const isUp = direction === "up";
  const Icon = isUp ? ChevronUp : ChevronDown;
  const label = isUp ? "Продължете нагоре" : "Продължете надолу";

  return (
    <button
      type="button"
      onClick={() => skipExperienceTour(direction)}
      aria-label={isUp ? "Пропусни разходката и продължи нагоре" : "Пропусни разходката и продължи надолу"}
      className={cn(
        "eyebrow z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2.5 text-[10px] text-white/75 backdrop-blur-md transition",
        "hover:border-[var(--gold)]/50 hover:bg-black/60 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60",
        className
      )}
    >
      {isUp && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {label}
      {!isUp && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
    </button>
  );
}

function DesktopScrollPanelExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(EXPERIENCE_PANELS.length - 1, Math.floor(v * EXPERIENCE_PANELS.length));
    setActiveIndex(idx);
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.12], [1, 0.4, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.12], [0, -16]);

  if (reducedMotion) {
    return (
      <section id="experience" className="scroll-section-fullscreen immersive-section bg-[var(--ink)] py-24">
        <div className="container mx-auto">
          <p className="eyebrow mb-3 text-center text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mb-16 text-center font-serif text-4xl font-bold text-white md:text-5xl">
            Влезте, преди да сте дошли
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE_PANELS.map(panel => (
              <div key={panel.id} className="overflow-hidden rounded-2xl border border-white/10">
                <img src={panel.image} alt={panel.imageAlt} className="h-64 w-full object-cover" />
                <div className="p-6">
                  <p className="eyebrow mb-2 text-[var(--gold)]">{panel.room}</p>
                  <h3 className="font-serif text-2xl font-bold text-white">{panel.title}</h3>
                  <p className="mt-2 text-white/70">{panel.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="experience"
      ref={containerRef}
      className="scroll-section-fullscreen relative bg-[var(--ink)]"
      style={{ height: `${EXPERIENCE_PANELS.length * 100}dvh` }}
      aria-label="Виртуална 3D разходка"
    >
      <div
        id="experience-viewport"
        className="relative sticky top-0 h-[100dvh] min-h-[100dvh] overflow-x-hidden"
      >
        <div className="ambient-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--ink)_75%)]" />

        <motion.div
          className="pointer-events-none absolute left-4 top-20 z-20 md:left-10 md:top-24"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="eyebrow text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white md:text-4xl">
            Влезте, преди да сте дошли
          </h2>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            Превъртете и обиколете вилата стая по стая
          </p>
        </motion.div>

        <ScrollProgress
          scrollYProgress={scrollYProgress}
          total={EXPERIENCE_PANELS.length}
          activeIndex={activeIndex}
        />

        <div className="panel-stage absolute inset-0 flex items-center justify-center">
          {EXPERIENCE_PANELS.map((panel, index) => (
            <PanelLayer
              key={panel.id}
              panel={panel}
              index={index}
              total={EXPERIENCE_PANELS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4 md:top-6">
          <SkipTourButton direction="up" className="pointer-events-auto" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center px-4 md:bottom-8">
          <SkipTourButton
            direction="down"
            className="pointer-events-auto motion-reduce:animate-none animate-pulse"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Entry point — route to mobile or desktop version ────────────────────────

export function ScrollPanelExperience() {
  if (IS_MOBILE) return <MobileScrollPanelExperience />;
  return <DesktopScrollPanelExperience />;
}
