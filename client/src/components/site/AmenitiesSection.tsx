import { AMENITIES } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function AmenitiesSection() {
  return (
    <SectionShell
      eyebrow="Удобства"
      title="Всичко необходимо за един спокоен престой"
      subtitle="Помислили сме за дребните неща, за да можете вие да мислите само за почивката"
      backgroundImage="/photos/56.jpg"
      dark
      darkOverlap
      splitTitle
      perfDefer
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {AMENITIES.map((amenity, idx) => {
          const Icon = amenity.icon;
          return (
            <ScrollReveal key={amenity.title} delay={idx * 80}>
              <div className="group amenity-glass-card relative h-full overflow-hidden rounded-2xl border border-white/10 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/30 hover:bg-white/10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--gold)]/5 blur-2xl transition group-hover:bg-[var(--gold)]/10" />
                <Icon className="relative mb-6 h-12 w-12 text-[var(--gold)] transition duration-500 group-hover:scale-110" />
                <h3 className="relative mb-3 font-serif text-xl font-bold text-white">{amenity.title}</h3>
                <p className="relative text-white/75">{amenity.description}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
