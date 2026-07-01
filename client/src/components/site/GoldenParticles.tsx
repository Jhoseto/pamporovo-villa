const MOBILE_PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${15 + i * 14}%`,
  top: `${10 + ((i * 23) % 75)}%`,
  size: 2 + (i % 2),
  delay: (i % 3) * 1.2,
  duration: 5 + i * 0.8,
}));

const DESKTOP_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 17) % 84)}%`,
  top: `${5 + ((i * 23) % 90)}%`,
  size: 2 + (i % 3),
  delay: (i % 6) * 0.8,
  duration: 4 + (i % 4) * 1.5,
}));

const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
const PARTICLES = isMobile ? MOBILE_PARTICLES : DESKTOP_PARTICLES;

export function GoldenParticles() {
  if (isMobile) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map(p => (
        <span
          key={p.id}
          className="golden-particle absolute rounded-full bg-[var(--gold)]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
