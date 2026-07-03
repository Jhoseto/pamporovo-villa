import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/contexts/LocaleContext";
import { usePamporovoFaqItems } from "@/i18n/contentHooks";
import type { PamporovoFaqTag } from "@shared/pamporovoFaq";

type PamporovoFaqSectionProps = {
  tags?: PamporovoFaqTag[];
  title?: string;
  limit?: number;
  className?: string;
};

export function PamporovoFaqSection({
  tags,
  title,
  limit,
  className,
}: PamporovoFaqSectionProps) {
  const { t } = useTranslation();
  const items = usePamporovoFaqItems(tags);
  const visible = limit ? items.slice(0, limit) : items;
  const heading = title ?? t("hub.faqDefault", "Често задавани въпроси");

  if (visible.length === 0) return null;

  return (
    <section className={className} aria-labelledby="pamporovo-faq-heading">
      <h2 id="pamporovo-faq-heading" className="font-serif text-2xl font-semibold md:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {t(
          "hub.faqSubtitle",
          "Бързи отговори за настаняване, писти и практични детайли — полезни за търсене и планиране на почивка."
        )}
      </p>
      <Accordion type="single" collapsible className="mt-6 w-full divide-y rounded-2xl border border-black/8 bg-white px-2">
        {visible.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="border-black/6 px-2">
            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
