import { Crown } from "lucide-react";
import { VIP_PROGRAM } from "@/data/siteContent";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function VipSection() {
  return (
    <SectionShell
      id="vip"
      eyebrow="VIP програма"
      title={VIP_PROGRAM.title}
      subtitle={VIP_PROGRAM.intro}
      overlap
      splitTitle
    >
      <ScrollReveal>
        <div className="floating-card mx-auto max-w-3xl p-8 md:p-10">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Crown className="h-8 w-8" />
            </div>
          </div>
          <ul className="space-y-4">
            {VIP_PROGRAM.benefits.map(benefit => (
              <li key={benefit} className="flex gap-3 text-lg text-foreground/80">
                <span className="mt-1 font-bold text-[var(--gold)]">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </ScrollReveal>
    </SectionShell>
  );
}
