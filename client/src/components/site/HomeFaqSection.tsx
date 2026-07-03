import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useHomeFaqItems, useTranslation } from "@/contexts/LocaleContext";

type HomeFaqSectionProps = {
  limit?: number;
  className?: string;
};

export function HomeFaqSection({ limit = 15, className }: HomeFaqSectionProps) {
  const { t } = useTranslation();
  const all = useHomeFaqItems();
  const items = limit ? all.slice(0, limit) : all;

  return (
    <section
      id="faq"
      className={className}
      aria-labelledby="home-faq-heading"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <p className="eyebrow mb-3 text-[var(--gold)]">
          {t("home.faq.eyebrow", "Резервация · цени")}
        </p>
        <h2 id="home-faq-heading" className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {t("home.faq.title", "Често задавани въпроси")}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {t("home.faq.subtitle", "Отговори за наем, цени, настаняване и резервация — преди да попълните формата.")}
        </p>
        <Accordion
          type="single"
          collapsible
          className="mt-8 w-full"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left font-display text-base tracking-wide">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
