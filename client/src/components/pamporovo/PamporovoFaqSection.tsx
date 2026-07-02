import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageLang } from "@/hooks/usePageLang";
import { getLocalizedPamporovoFaq } from "@shared/en/faqEn";
import { EN_UI } from "@shared/en/commonUi";
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
  const lang = usePageLang();
  const en = lang === "en";
  const items = getLocalizedPamporovoFaq(lang, tags);
  const visible = limit ? items.slice(0, limit) : items;
  const heading = title ?? (en ? EN_UI.faqDefault : "Често задавани въпроси");

  if (visible.length === 0) return null;

  return (
    <section className={className} aria-labelledby="pamporovo-faq-heading">
      <h2 id="pamporovo-faq-heading" className="font-serif text-2xl font-semibold md:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {en ? EN_UI.faqSubtitle : "Кратки отговори за настаняване, писти и практични детайли — полезни и за търсене, и за планиране на почивката."}
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
