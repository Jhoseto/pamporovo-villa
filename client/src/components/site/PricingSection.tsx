import { useState } from "react";
import { Snowflake, Sun } from "lucide-react";
import { PRICING_NOTES, VILLAS, formatPriceEur } from "@/data/siteContent";
import {
  getPerNightRateFromGrid,
  getVillaPricingRows,
  type PricingGridRow,
} from "@/lib/pricing";
import { trpc } from "@/lib/trpc";
import { scrollToSection } from "@/lib/scroll";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

type VillaPricingProps = {
  villaId: string;
  rows: PricingGridRow[];
};

function PricingDesktopTable({ villaId, rows }: VillaPricingProps) {
  const villaRows = getVillaPricingRows(rows, villaId);

  return (
    <div className="floating-card hidden overflow-hidden md:block">
      <table className="w-full text-left">
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
          {villaRows.map(row => (
            <tr key={row.tierKey} className="border-b border-border/40 last:border-0">
              <td className="px-6 py-4 font-medium">{row.tierLabel}</td>
              <td className="px-6 py-4 font-serif text-xl font-bold text-primary">
                {formatPriceEur(getPerNightRateFromGrid(row, "winter"))}
              </td>
              <td className="px-6 py-4 font-serif text-xl font-bold text-primary">
                {formatPriceEur(getPerNightRateFromGrid(row, "summer"))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingMobileCards({ villaId, rows }: VillaPricingProps) {
  const villaRows = getVillaPricingRows(rows, villaId);

  return (
    <div className="pricing-mobile md:hidden">
      <div className="pricing-mobile-legend">
        <div className="pricing-mobile-legend-item">
          <Snowflake className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          <span>Зима · септ. – март</span>
        </div>
        <div className="pricing-mobile-legend-item">
          <Sun className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={1.75} />
          <span>Лято · апр. – авг.</span>
        </div>
      </div>

      <ul className="pricing-mobile-list">
        {villaRows.map((row, index) => (
          <li key={row.tierKey} className="pricing-mobile-card">
            <div className="pricing-mobile-prices">
              <div className="pricing-mobile-price pricing-mobile-price--winter">
                <span className="pricing-mobile-price-label">
                  <Snowflake className="h-3 w-3" strokeWidth={1.75} />
                  Зима
                </span>
                <span className="pricing-mobile-price-value">
                  {formatPriceEur(getPerNightRateFromGrid(row, "winter"))}
                </span>
              </div>
              <div className="pricing-mobile-center">
                <p className="pricing-mobile-nights">{row.tierLabel}</p>
              </div>
              <div className="pricing-mobile-price pricing-mobile-price--summer">
                <span className="pricing-mobile-price-label">
                  <Sun className="h-3 w-3" strokeWidth={1.75} />
                  Лято
                </span>
                <span className="pricing-mobile-price-value">
                  {formatPriceEur(getPerNightRateFromGrid(row, "summer"))}
                </span>
              </div>
            </div>
            {index === villaRows.length - 1 && (
              <p className="pricing-mobile-best">Най-изгодно при по-дълъг престой</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingSection() {
  const [selectedVillaId, setSelectedVillaId] = useState(VILLAS[0]?.id ?? "villa-1");
  const { data, isLoading } = trpc.content.getPricing.useQuery();
  const rows = (data?.rows ?? []) as PricingGridRow[];

  return (
    <SectionShell
      eyebrow="Цени"
      title="Ясни цени, без изненади"
      subtitle="Наем на цяла вила на вечер — за до 6 гости. Колкото по-дълго останете, толкова по-изгодно"
      overlap
      splitTitle
      perfDefer
    >
      <ScrollReveal>
        {isLoading ? (
          <div className="mx-auto max-w-4xl animate-pulse space-y-4">
            <div className="h-12 rounded-xl bg-muted/40" />
            <div className="h-64 rounded-2xl bg-muted/30" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground">Цените скоро ще бъдат публикувани.</p>
        ) : (
          <Tabs
            value={selectedVillaId}
            onValueChange={setSelectedVillaId}
            className="pricing-villa-tabs mx-auto max-w-4xl gap-6"
          >
            <TabsList className="pricing-villa-tabs-list h-auto w-full">
              {VILLAS.map(villa => (
                <TabsTrigger
                  key={villa.id}
                  value={villa.id}
                  className="pricing-villa-tab-trigger flex-1 px-3 py-3 sm:px-5"
                >
                  {villa.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div key={selectedVillaId}>
              <PricingMobileCards villaId={selectedVillaId} rows={rows} />
              <PricingDesktopTable villaId={selectedVillaId} rows={rows} />
            </div>
          </Tabs>
        )}
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
          Проверете свободни дати
        </MagneticButton>
      </ScrollReveal>
    </SectionShell>
  );
}
