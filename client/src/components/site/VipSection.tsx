import { Crown, Sparkles } from "lucide-react";
import { VIP_PROGRAM } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function VipSection() {
  return (
    <SectionShell
      eyebrow="VIP програма"
      title={VIP_PROGRAM.title}
      subtitle={VIP_PROGRAM.intro}
      overlap
      splitTitle
      perfDefer
    >
      <ScrollReveal>
        <div className="vip-card relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[var(--gold)]/45 p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-[var(--ink)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.28_0.06_65/0.55)] via-[var(--ink)] to-[oklch(0.12_0.02_45/0.95)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.72_0.14_75/0.22),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,oklch(0.55_0.12_65/0.12),transparent_45%)]" />
            <div className="film-grain absolute inset-0 opacity-[0.14]" />
          </div>

          <div className="relative text-center">
            <p className="eyebrow mb-6 inline-flex items-center gap-2 text-[var(--gold)]">
              <Sparkles className="h-3.5 w-3.5" />
              Ексклузивни привилегии
            </p>

            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 shadow-[0_0_40px_-8px_oklch(0.72_0.14_75/0.55)] md:h-24 md:w-24">
              <Crown className="h-10 w-10 text-[var(--gold)] md:h-12 md:w-12" strokeWidth={1.25} />
            </div>

            <ul className="space-y-5 text-left md:mx-auto md:max-w-xl">
              {VIP_PROGRAM.benefits.map(benefit => (
                <li
                  key={benefit}
                  className="flex gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 font-display text-sm text-[var(--gold)]">
                    ✓
                  </span>
                  <span className="font-display text-lg leading-relaxed tracking-wide text-white/88 md:text-xl">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
