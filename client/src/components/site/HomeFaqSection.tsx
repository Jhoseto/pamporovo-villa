import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageLang } from "@/hooks/usePageLang";
import { getLocalizedHomeFaq } from "@shared/en/faqEn";
import { EN_UI } from "@shared/en/commonUi";

type HomeFaqSectionProps = {
  limit?: number;
  className?: string;
};

export function HomeFaqSection({ limit = 15, className }: HomeFaqSectionProps) {
  const lang = usePageLang();
  const en = lang === "en";
  const all = getLocalizedHomeFaq(lang);
  const items = limit ? all.slice(0, limit) : all;

  return (
    <section
      id="faq"
      className={className}
      aria-labelledby="home-faq-heading"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <p className="eyebrow mb-3 text-[var(--gold)]">
          {en ? EN_UI.homeFaqEyebrow : "Резервация · цени"}
        </p>
        <h2 id="home-faq-heading" className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {en ? EN_UI.homeFaqTitle : "Често задавани въпроси"}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {en ? EN_UI.homeFaqSubtitle : "Отговори за наем, цени, настаняване и резервация — преди да попълните формата."}
        </p>
        <Accordion
          type="single"
          collapsible
          className="mt-8 w-full divide-y rounded-2xl border border-black/8 bg-white px-2 shadow-sm"
        >
          {items.map((item) => (
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
      </div>
    </section>
  );
}
