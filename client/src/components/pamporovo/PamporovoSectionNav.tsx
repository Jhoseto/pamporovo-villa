import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "pamporovo-intro", label: "Курортът" },
  { id: "pamporovo-winter", label: "Зима" },
  { id: "pamporovo-summer", label: "Лято" },
  { id: "pamporovo-landmarks", label: "Околността" },
  { id: "pamporovo-caves", label: "Пещери" },
] as const;

export function PamporovoSectionNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Секции на страницата"
      className="sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-40 border-b border-black/8 bg-[var(--cream)]/95 backdrop-blur-md"
    >
      <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className={cn(
              "shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium tracking-wide",
              "text-foreground/75 transition hover:border-[var(--gold)]/50 hover:text-[var(--gold)]"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
