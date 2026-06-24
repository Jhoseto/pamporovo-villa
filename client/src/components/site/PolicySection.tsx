import { HOUSE_RULES } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function PolicySection() {
  return (
    <SectionShell
      id="policy"
      eyebrow="Политика"
      title="Политика на Pamporovo Villa"
      subtitle="Моля, запознайте се с правилата преди настаняване"
      dark
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="mb-4 font-serif text-xl font-bold text-white">Настаняване и престой</h3>
            <p className="mb-4 text-white/70">
              Check-in: <strong className="text-white">{HOUSE_RULES.checkIn}</strong> · Check-out:{" "}
              <strong className="text-white">{HOUSE_RULES.checkOut}</strong>
            </p>
            <ul className="space-y-3 text-white/75">
              {HOUSE_RULES.highlights.map(rule => (
                <li key={rule} className="flex gap-2">
                  <span className="text-[var(--gold)]">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={120}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="mb-4 font-serif text-xl font-bold text-white">Забранено</h3>
            <ul className="space-y-3 text-white/75">
              {HOUSE_RULES.prohibited.map(rule => (
                <li key={rule} className="flex gap-2">
                  <span className="text-red-300">×</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/50">
              Благодарим ви, че избрахте Pamporovo Villa. Гостите, нарушаващи правилата, могат да
              бъдат настанени да напуснат без възстановяване на сумата.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
