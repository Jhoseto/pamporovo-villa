const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 17) % 84)}%`,
  top: `${5 + ((i * 23) % 90)}%`,
  size: 2 + (i % 3),
  delay: (i % 6) * 0.8,
  duration: 4 + (i % 4) * 1.5,
}));

export function GoldenParticles() {
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
