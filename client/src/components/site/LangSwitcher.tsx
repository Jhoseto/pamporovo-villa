import { Check, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "wouter";
import { usePageLang } from "@/hooks/usePageLang";
import { useTranslation } from "@/contexts/LocaleContext";
import { ALL_LOCALES, LOCALE_META, SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type LangSwitcherProps = {
  className?: string;
  variant?: "pill" | "header";
};

function stopScrollChaining(event: React.WheelEvent<HTMLDivElement>) {
  const el = event.currentTarget;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
  const scrollingUp = event.deltaY < 0;
  const scrollingDown = event.deltaY > 0;

  if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
    event.preventDefault();
  }
  event.stopPropagation();
}

export function LangSwitcher({ className, variant = "pill" }: LangSwitcherProps) {
  const lang = usePageLang();
  const [, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const switchTo = (target: SiteLocale) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (target === SOURCE_LOCALE) next.delete("lang");
      else next.set("lang", target);
      return next;
    });
    setOpen(false);
  };

  const current = LOCALE_META[lang];

  const triggerClass =
    variant === "header"
      ? cn(
          "lang-switcher-trigger group flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[0.6875rem] font-medium tracking-wide text-white/85 backdrop-blur-md transition-all duration-200",
          "hover:border-white/25 hover:bg-black/35 hover:text-white",
          "data-[state=open]:border-[var(--gold)]/45 data-[state=open]:bg-black/40 data-[state=open]:text-[var(--gold)]",
          className
        )
      : cn(
          "lang-switcher-trigger group flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200",
          "hover:border-[var(--gold)]/35 hover:text-[var(--gold)]",
          "data-[state=open]:border-[var(--gold)]/45 data-[state=open]:text-[var(--gold)]",
          className
        );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={t("common.langLabel", "Език")}
          aria-expanded={open}
        >
          <Globe className="h-3 w-3 shrink-0 opacity-75" aria-hidden />
          <span className="max-w-[5.5rem] truncate">{current.nativeName}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 opacity-60 transition-transform duration-200",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        collisionPadding={16}
        className="lang-switcher-content z-[60] w-auto border-0 bg-transparent p-0 shadow-none outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="hero-glass-panel lang-switcher-panel w-[12.75rem]">
          <div className="border-b border-white/10 px-4 py-2.5">
            <p className="font-display text-[0.58rem] tracking-[0.18em] text-[var(--gold)] uppercase">
              {t("common.langLabel", "Език")}
            </p>
          </div>

          <div
            className="lang-switcher-scroll max-h-[min(16.5rem,70dvh)] py-1.5"
            data-lenis-prevent
            onWheel={stopScrollChaining}
          >
            {ALL_LOCALES.map((code) => {
              const meta = LOCALE_META[code];
              const active = code === lang;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchTo(code)}
                  className={cn(
                    "lang-switcher-item mx-1.5 flex w-[calc(100%-0.75rem)] cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors",
                    active
                      ? "bg-[var(--gold)]/14 text-[var(--gold)]"
                      : "text-white/88 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center",
                      !active && "opacity-0"
                    )}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium leading-tight">{meta.nativeName}</span>
                    {code !== SOURCE_LOCALE && (
                      <span
                        className={cn(
                          "truncate text-[0.65rem] leading-tight",
                          active ? "text-[var(--gold)]/70" : "text-white/42"
                        )}
                      >
                        {meta.label}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
