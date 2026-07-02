import { useLocation } from "wouter";
import { usePageLang, usePageSearch } from "@/hooks/usePageLang";
import { toggleLangPath } from "@/lib/localizedNav";
import { EN_UI } from "@shared/en/commonUi";
import type { SeoLang } from "@shared/seoEnMeta";
import { cn } from "@/lib/utils";

type LangSwitcherProps = {
  className?: string;
  variant?: "pill" | "header";
};

export function LangSwitcher({ className, variant = "pill" }: LangSwitcherProps) {
  const [location, setLocation] = useLocation();
  const lang = usePageLang();
  const search = usePageSearch();

  const switchTo = (target: SeoLang) => {
    setLocation(toggleLangPath(location, search, target));
  };

  if (variant === "header") {
    return (
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-full border border-white/15 bg-black/20 p-0.5 text-[0.6875rem] font-medium tracking-wide",
          className
        )}
        role="group"
        aria-label="Language"
      >
        <button
          type="button"
          onClick={() => switchTo("bg")}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            lang === "bg" ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "text-white/60 hover:text-white"
          )}
          aria-pressed={lang === "bg"}
        >
          {EN_UI.langBg}
        </button>
        <button
          type="button"
          onClick={() => switchTo("en")}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            lang === "en" ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "text-white/60 hover:text-white"
          )}
          aria-pressed={lang === "en"}
        >
          {EN_UI.langEn}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 text-xs", className)} role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => switchTo("bg")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          lang === "bg" ? "bg-[var(--gold)]/15 text-foreground" : "text-muted-foreground hover:text-[var(--gold)]"
        )}
        aria-pressed={lang === "bg"}
      >
        {EN_UI.langBg}
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          lang === "en" ? "bg-[var(--gold)]/15 text-foreground" : "text-muted-foreground hover:text-[var(--gold)]"
        )}
        aria-pressed={lang === "en"}
      >
        {EN_UI.langEn}
      </button>
    </div>
  );
}
