import { PRICING_NOTES, PRICING_TABLE } from "@/data/siteContent";
import { scrollToSection } from "@/lib/scroll";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function PricingSection() {
  return (
    <SectionShell
      id="pricing"
      eyebrow="Цени"
      title="Стандартни цени"
      subtitle="Цена за една вила на вечер — до 6 гости, без изхранване"
      overlap
      splitTitle
    >
      <ScrollReveal>
        <div className="floating-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-6 py-4 font-serif text-lg font-bold">Брой нощувки</th>
                  <th className="px-6 py-4 font-serif text-lg font-bold">
                    Зимен сезон
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      септември – март
                    </span>
                  </th>
                  <th className="px-6 py-4 font-serif text-lg font-bold">
                    Летен сезон
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      април – август
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRICING_TABLE.map(row => (
                  <tr key={row.nights} className="border-b border-border/40 last:border-0">
                    <td className="px-6 py-4 font-medium">{row.nights}</td>
                    <td className="px-6 py-4 font-serif text-xl font-bold text-primary">{row.winter}</td>
                    <td className="px-6 py-4 font-serif text-xl font-bold text-primary">{row.summer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={120} className="mt-8 space-y-3">
        {PRICING_NOTES.map(note => (
          <p key={note} className="text-center text-sm text-muted-foreground md:text-base">
            {note}
          </p>
        ))}
      </ScrollReveal>

      <ScrollReveal delay={180} className="mt-10 text-center">
        <MagneticButton className="premium-btn px-10" onClick={() => scrollToSection("booking")}>
          Резервирайте онлайн
        </MagneticButton>
      </ScrollReveal>
    </SectionShell>
  );
}
