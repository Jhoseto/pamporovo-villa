import { useTranslation } from "@/contexts/LocaleContext";
import { useHouseRules } from "@/i18n/contentHooks";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function PolicySection() {
  const { t } = useTranslation();
  const rules = useHouseRules();

  return (
    <SectionShell
      eyebrow={t("home.policy.eyebrow", "Добре е да знаете")}
      title={t("home.policy.title", "Няколко думи преди да дойдете")}
      subtitle={t("home.policy.subtitle", "Кратки и ясни правила, за да е спокойно и приятно за всички")}
      dark
      darkOverlap
      perfDefer
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <div className="policy-glass-panel rounded-3xl border border-white/10 p-8">
            <h3 className="mb-4 font-serif text-xl font-bold text-white">{rules.stayHeading}</h3>
            <p className="mb-4 text-white/65">{rules.stayIntro}</p>
            <p className="mb-4 text-white/70">
              {rules.checkInLabel}: <strong className="text-white">{rules.checkIn}</strong> ·{" "}
              {rules.checkOutLabel}: <strong className="text-white">{rules.checkOut}</strong>
            </p>
            <ul className="space-y-3 text-white/75">
              {rules.highlights.map(rule => (
                <li key={rule} className="flex gap-2">
                  <span className="text-[var(--gold)]">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={120}>
          <div className="policy-glass-panel rounded-3xl border border-white/10 p-8">
            <h3 className="mb-4 font-serif text-xl font-bold text-white">{rules.avoidHeading}</h3>
            <ul className="space-y-3 text-white/75">
              {rules.prohibited.map(rule => (
                <li key={rule} className="flex gap-2">
                  <span className="text-red-300">×</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/50">{rules.footer}</p>
          </div>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
