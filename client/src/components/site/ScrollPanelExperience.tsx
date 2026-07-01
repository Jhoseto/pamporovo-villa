import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
import { EXPERIENCE_PANELS, type ExperiencePanel } from "@/data/experiencePanels";
import { skipExperienceTour } from "@/lib/scroll";
import { cn } from "@/lib/utils";

// ─── Device check — width only; tablets/touchscreen laptops get 3D desktop ──
const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

// ─── Shared skip button ───────────────────────────────────────────────────────

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
      aria-label={isUp ? "Пропусни разходката нагоре" : "Пропусни разходката надолу"}
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

// ─── MOBILE: sticky scroll — 2D transforms only, no GPU-killing 3D ────────────

function MobilePanelLayer({
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
  const enter = start + segment * 0.18;
  const exit = end - segment * 0.18;

  // 2D only — no rotateX/Y/Z, no preserve-3d, no translateZ
  const opacity = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    [0, 1, 1, index === total - 1 ? 1 : 0]
  );

  const panelY = useTransform(
    scrollYProgress,
    [start, enter, exit, end],
    [50, 0, 0, -30]
  );

  // Subtle Ken Burns — GPU-safe single scale
  const imageScale = useTransform(scrollYProgress, [start, end], [1.07, 1.0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, zIndex: total - index }}
    >
      <div className="relative h-full overflow-hidden">
        {/* Full-bleed photo */}
        <motion.img
          src={panel.image}
          alt={panel.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ scale: imageScale }}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />

        {/* Gradient — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-22"
          style={{
            background: `radial-gradient(ellipse at 30% 80%, ${panel.accent}, transparent 50%)`,
          }}
        />

        {/* Glass bar — full width, fixed two-row layout */}
        <motion.div
          className="absolute inset-x-0 bottom-0"
          style={{ y: panelY }}
        >
          <div
            className="border-t border-white/10 px-5 pb-[max(4.5rem,env(safe-area-inset-bottom,36px))] pt-3"
            style={{
              background: "oklch(0 0 0 / 0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Left — room + subtitle */}
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="eyebrow text-[0.54rem] text-[var(--gold)]">{panel.room}</p>
                <p className="mt-1.5 line-clamp-1 text-[0.68rem] leading-none text-white/55">
                  {panel.subtitle}
                </p>
              </div>

              {/* Divider */}
              <div className="mt-1 h-8 w-px shrink-0 bg-white/15" />

              {/* Right — title, strictly 2 rows */}
              <div className="w-[50%] shrink-0 overflow-hidden text-right">
                <h2 className="line-clamp-2 font-serif text-[0.95rem] font-bold leading-snug text-white">
                  {panel.title}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MobileScrollPanelExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);
  const total = EXPERIENCE_PANELS.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Only fire setState when the panel actually changes — not on every scroll tick
  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(total - 1, Math.floor(v * total));
    if (idx !== prevIndexRef.current) {
      prevIndexRef.current = idx;
      setActiveIndex(idx);
    }
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.12], [1, 0.4, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.12], [0, -10]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative bg-[var(--ink)]"
      style={{ height: `${total * 100}dvh` }}
      aria-label="Виртуална разходка"
    >
      <div className="relative sticky top-0 h-[100dvh] min-h-[100dvh] overflow-hidden">
        {/* Fade-out header */}
        <motion.div
          className="pointer-events-none absolute left-5 right-14 top-[max(3.5rem,env(safe-area-inset-top,0px))] z-20"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="eyebrow text-[0.58rem] text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mt-1 font-serif text-lg font-bold text-white">
            Влезте, преди да сте дошли
          </h2>
        </motion.div>

        {/* Vertical progress pills — right edge */}
        <div className="absolute right-3.5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1.5">
          {EXPERIENCE_PANELS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-[var(--gold)] transition-all duration-500",
                i === activeIndex ? "h-5 w-1.5 opacity-100" : "h-1.5 w-1.5 opacity-25"
              )}
            />
          ))}
        </div>

        {/* Panel counter — bottom right */}
        <div className="absolute bottom-[max(4rem,env(safe-area-inset-bottom,40px))] right-4 z-20">
          <span className="eyebrow text-[0.58rem] text-white/45">
            {String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(total).padStart(2, "0")}
          </span>
        </div>

        {/* All panels stacked */}
        <div className="absolute inset-0">
          {EXPERIENCE_PANELS.map((panel, index) => (
            <MobilePanelLayer
              key={panel.id}
              panel={panel}
              index={index}
              total={total}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Skip tour — up */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center">
          <SkipTourButton direction="up" className="pointer-events-auto" />
        </div>

        {/* Skip tour — down */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center">
          <SkipTourButton direction="down" className="pointer-events-auto animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}

// ─── DESKTOP: full 3D sticky scroll (unchanged) ───────────────────────────────

function DesktopPanelLayer({
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
        <motion.div
          className="pointer-events-none absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/[0.03]"
          style={{ translateZ: depthPanelZ, rotateZ: index % 2 === 0 ? -2 : 2 }}
        />

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

            {/* Full-width bottom bar — two columns, smaller fonts */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="glass-panel rounded-b-[1.75rem] rounded-t-none border-x-0 border-b-0 px-6 py-5 md:px-10 md:py-6">
                <div className="flex items-center gap-6 md:gap-10">
                  {/* Left: title + subtitle */}
                  <div className="w-[40%] shrink-0">
                    <h2 className="font-serif text-lg font-bold leading-snug text-white md:text-2xl lg:text-3xl">
                      {panel.title}
                    </h2>
                    <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-white/50 md:text-xs">
                      {panel.subtitle}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-10 w-px shrink-0 bg-white/15" />

                  {/* Right: eyebrow + description (full text always) */}
                  <div className="min-w-0 flex-1 text-right">
                    <p className="eyebrow mb-2 text-[var(--gold)]">{panel.room}</p>
                    <p className="text-xs leading-relaxed text-white/75 md:text-sm">
                      {panel.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

function DesktopScrollProgress({
  scrollYProgress,
  total,
  activeIndex,
}: {
  scrollYProgress: MotionValue<number>;
  total: number;
  activeIndex: number;
}) {
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      <div className="relative h-48 w-px bg-white/20">
        <motion.div className="absolute left-0 top-0 w-full origin-top bg-[var(--gold)]" style={{ height }} />
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

function DesktopScrollPanelExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(EXPERIENCE_PANELS.length - 1, Math.floor(v * EXPERIENCE_PANELS.length));
    if (idx !== prevIndexRef.current) {
      prevIndexRef.current = idx;
      setActiveIndex(idx);
    }
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.12], [1, 0.4, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.12], [0, -16]);

  if (reducedMotion) {
    return (
      <section
        id="experience"
        className="scroll-section-fullscreen immersive-section bg-[var(--ink)] py-24"
      >
        <div className="container mx-auto">
          <p className="eyebrow mb-3 text-center text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mb-16 text-center font-serif text-4xl font-bold text-white md:text-5xl">
            Влезте, преди да сте дошли
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE_PANELS.map(panel => (
              <div key={panel.id} className="overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={panel.image}
                  alt={panel.imageAlt}
                  className="h-64 w-full object-cover"
                />
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
            Превъртете и обиколете вилите стая по стая
          </p>
        </motion.div>

        <DesktopScrollProgress
          scrollYProgress={scrollYProgress}
          total={EXPERIENCE_PANELS.length}
          activeIndex={activeIndex}
        />

        <div className="panel-stage absolute inset-0 flex items-center justify-center">
          {EXPERIENCE_PANELS.map((panel, index) => (
            <DesktopPanelLayer
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
            className="pointer-events-auto animate-pulse motion-reduce:animate-none"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function ScrollPanelExperience() {
  if (IS_MOBILE) return <MobileScrollPanelExperience />;
  return <DesktopScrollPanelExperience />;
}
