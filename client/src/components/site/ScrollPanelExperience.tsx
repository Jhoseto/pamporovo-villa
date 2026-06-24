import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { EXPERIENCE_PANELS, type ExperiencePanel } from "@/data/experiencePanels";
import { cn } from "@/lib/utils";

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
          className="absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm"
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

            {/* Overlapping info panel — bottom */}
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

            {/* Decorative frame overlap */}
            <div
              className={cn(
                "pointer-events-none absolute h-32 w-48 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md",
                index % 2 === 0 ? "-left-4 top-12" : "-right-4 bottom-32"
              )}
              style={{ transform: `translateZ(40px)` }}
            />
          </div>

          {/* Overlapping side panel — highlights (outside clip) */}
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

export function ScrollPanelExperience() {
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
    const idx = Math.min(
      EXPERIENCE_PANELS.length - 1,
      Math.floor(v * EXPERIENCE_PANELS.length)
    );
    setActiveIndex(idx);
  });

  const scrollHintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  if (reducedMotion) {
    return (
      <section id="experience" className="immersive-section bg-[var(--ink)] py-24">
        <div className="container mx-auto">
          <p className="eyebrow mb-3 text-center text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mb-16 text-center font-serif text-4xl font-bold text-white md:text-5xl">
            Нашето предложение
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
      className="relative bg-[var(--ink)]"
      style={{ height: `${EXPERIENCE_PANELS.length * 100}vh` }}
      aria-label="Виртуална 3D разходка"
    >
      <div className="relative sticky top-0 h-screen overflow-x-hidden">
        <div className="ambient-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--ink)_75%)]" />

        <div className="absolute left-4 top-20 z-20 md:left-10 md:top-24">
          <p className="eyebrow text-[var(--gold)]">Виртуална разходка</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white md:text-4xl">
            Нашето предложение
          </h2>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            Скролирайте, за да разгледате всичко важно във всяка вила
          </p>
        </div>

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

        <motion.div
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center"
          style={{ opacity: scrollHintOpacity }}
        >
          <p className="eyebrow motion-reduce:animate-none animate-pulse text-white/60">Продължете надолу</p>
        </motion.div>
      </div>
    </section>
  );
}
