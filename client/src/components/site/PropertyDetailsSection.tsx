import { PROPERTY_STATS, VILLA_ABOUT } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function PropertyDetailsSection() {
  return (
    <SectionShell
      id="about"
      eyebrow="За нас"
      title="Вашият дом високо в Родопите"
      subtitle="Три вили, една грижа — да се чувствате като у дома"
      overlap
      splitTitle
    >
      <ScrollReveal>
        <div className="floating-card mx-auto max-w-4xl space-y-5 p-8 text-lg leading-relaxed text-foreground/80 md:p-10">
          <p>{VILLA_ABOUT.intro}</p>
          <p>{VILLA_ABOUT.details}</p>
          <p>{VILLA_ABOUT.hosts}</p>
        </div>
      </ScrollReveal>

      <div className="mt-16 grid grid-cols-3 gap-6 rounded-3xl border border-border/60 bg-white/60 p-8 shadow-xl backdrop-blur-sm md:gap-12 md:p-12">
        {PROPERTY_STATS.map((stat, i) => (
          <ScrollReveal key={stat.label} delay={i * 100}>
            <div className="text-center">
              <p className="font-serif text-4xl font-bold text-[var(--gold)] md:text-5xl">{stat.suffix}</p>
              <p className="eyebrow mt-3 text-muted-foreground">{stat.label}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </SectionShell>
  );
}
