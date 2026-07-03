import { useState } from "react";
import { Snowflake, Sun } from "lucide-react";
import { formatPriceEur } from "@/data/siteContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { usePricingNotes, usePricingTierLabel, useVillasLocalized } from "@/i18n/contentHooks";
import {
  getPerNightRateFromGrid,
  getVillaPricingRows,
  type PricingGridRow,
} from "@/lib/pricing";
import { trpc } from "@/lib/trpc";
import { scrollToSection } from "@/lib/scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

type VillaPricingProps = {
  villaId: string;
  rows: PricingGridRow[];
};

function PricingDesktopTable({ villaId, rows }: VillaPricingProps) {
  const { t } = useTranslation();
  const villaRows = getVillaPricingRows(rows, villaId);

  return (
    <div className="floating-card hidden overflow-hidden md:block">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-6 py-4 font-serif text-lg font-bold">
              {t("pricing.tableNights", "Брой нощувки")}
            </th>
            <th className="px-6 py-4 font-serif text-lg font-bold">
              {t("pricing.winterSeason", "Зимен сезон")}
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {t("pricing.winterRange", "септември – март")}
              </span>
            </th>
            <th className="px-6 py-4 font-serif text-lg font-bold">
              {t("pricing.summerSeason", "Летен сезон")}
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                {t("pricing.summerRange", "април – август")}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {villaRows.map(row => (
            <TierRow key={row.tierKey} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TierRow({ row }: { row: PricingGridRow }) {
  const tierLabel = usePricingTierLabel(row.tierKey, row.tierLabel);
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="px-6 py-4 font-medium">{tierLabel}</td>
      <td className="px-6 py-4 font-serif text-xl font-bold text-primary">
        {formatPriceEur(getPerNightRateFromGrid(row, "winter"))}
      </td>
      <td className="px-6 py-4 font-serif text-xl font-bold text-primary">
        {formatPriceEur(getPerNightRateFromGrid(row, "summer"))}
      </td>
    </tr>
  );
}

function PricingMobileCards({ villaId, rows }: VillaPricingProps) {
  const { t } = useTranslation();
  const villaRows = getVillaPricingRows(rows, villaId);

  return (
    <div className="pricing-mobile md:hidden">
      <div className="pricing-mobile-legend">
        <div className="pricing-mobile-legend-item">
          <Snowflake className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          <span>{t("pricing.winterLegend", "Зима · септ. – март")}</span>
        </div>
        <div className="pricing-mobile-legend-item">
          <Sun className="h-3.5 w-3.5 text-[var(--gold)]" strokeWidth={1.75} />
          <span>{t("pricing.summerLegend", "Лято · апр. – авг.")}</span>
        </div>
      </div>

      <ul className="pricing-mobile-list">
        {villaRows.map((row, index) => (
          <MobileTierCard key={row.tierKey} row={row} isLast={index === villaRows.length - 1} />
        ))}
      </ul>
    </div>
  );
}

function MobileTierCard({ row, isLast }: { row: PricingGridRow; isLast: boolean }) {
  const { t } = useTranslation();
  const tierLabel = usePricingTierLabel(row.tierKey, row.tierLabel);

  return (
    <li className="pricing-mobile-card">
      <div className="pricing-mobile-prices">
        <div className="pricing-mobile-price pricing-mobile-price--winter">
          <span className="pricing-mobile-price-label">
            <Snowflake className="h-3 w-3" strokeWidth={1.75} />
            {t("pricing.winterShort", "Зима")}
          </span>
          <span className="pricing-mobile-price-value">
            {formatPriceEur(getPerNightRateFromGrid(row, "winter"))}
          </span>
        </div>
        <div className="pricing-mobile-center">
          <p className="pricing-mobile-nights">{tierLabel}</p>
        </div>
        <div className="pricing-mobile-price pricing-mobile-price--summer">
          <span className="pricing-mobile-price-label">
            <Sun className="h-3 w-3" strokeWidth={1.75} />
            {t("pricing.summerShort", "Лято")}
          </span>
          <span className="pricing-mobile-price-value">
            {formatPriceEur(getPerNightRateFromGrid(row, "summer"))}
          </span>
        </div>
      </div>
      {isLast && (
        <p className="pricing-mobile-best">
          {t("pricing.bestValue", "Най-изгодно при по-дълъг престой")}
        </p>
      )}
    </li>
  );
}

export function PricingSection() {
  const { t } = useTranslation();
  const villas = useVillasLocalized();
  const pricingNotes = usePricingNotes();
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id ?? "villa-1");
  const { data, isLoading } = trpc.content.getPricing.useQuery();
  const rows = (data?.rows ?? []) as PricingGridRow[];

  return (
    <SectionShell
      eyebrow={t("home.pricing.eyebrow", "Цени")}
      title={t("home.pricing.title", "Ясни цени, без изненади")}
      subtitle={t("home.pricing.subtitle", "Наем на цяла вила на вечер — за до 6 гости. Колкото по-дълго останете, толкова по-изгодно")}
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
          <p className="text-center text-muted-foreground">
            {t("pricing.loading", "Цените скоро ще бъдат публикувани.")}
          </p>
        ) : (
          <Tabs
            value={selectedVillaId}
            onValueChange={setSelectedVillaId}
            className="pricing-villa-tabs mx-auto max-w-4xl gap-6"
          >
            <TabsList className="pricing-villa-tabs-list h-auto w-full">
              {villas.map(villa => (
                <TabsTrigger
                  key={villa.id}
                  value={villa.id}
                  className="pricing-villa-tab-trigger flex-1 px-3 py-3 sm:px-5"
                >
                  {villa.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {villas.map(villa => (
              <TabsContent key={villa.id} value={villa.id} className="mt-0 outline-none">
                <PricingMobileCards villaId={villa.id} rows={rows} />
                <PricingDesktopTable villaId={villa.id} rows={rows} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ScrollReveal>

      <ScrollReveal delay={120} className="mt-8 space-y-3">
        {pricingNotes.map(note => (
          <p key={note} className="text-center text-sm text-muted-foreground md:text-base">
            {note}
          </p>
        ))}
      </ScrollReveal>

      <ScrollReveal delay={180} className="mt-10 text-center">
        <MagneticButton className="premium-btn px-10" onClick={() => scrollToSection("booking")}>
          {t("pricing.cta", "Проверете свободни дати")}
        </MagneticButton>
      </ScrollReveal>
    </SectionShell>
  );
}
