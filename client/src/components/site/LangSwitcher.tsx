import { ChevronDown, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { usePageLang, usePageSearch } from "@/hooks/usePageLang";
import { switchLangPath } from "@/lib/localizedNav";
import { useTranslation } from "@/contexts/LocaleContext";
import { ALL_LOCALES, LOCALE_META, SOURCE_LOCALE, type SiteLocale } from "@shared/i18n/locales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LangSwitcherProps = {
  className?: string;
  variant?: "pill" | "header";
};

export function LangSwitcher({ className, variant = "pill" }: LangSwitcherProps) {
  const [location, setLocation] = useLocation();
  const lang = usePageLang();
  const search = usePageSearch();
  const { t } = useTranslation();

  const switchTo = (target: SiteLocale) => {
    setLocation(switchLangPath(location, search, target));
  };

  const current = LOCALE_META[lang];

  const triggerClass =
    variant === "header"
      ? cn(
          "flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-white/80 transition-colors hover:text-white",
          className
        )
      : cn(
          "flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:text-[var(--gold)]",
          className
        );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={t("common.langLabel", "Език")}
        >
          <Globe className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          <span>{current.nativeName}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
        {ALL_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchTo(code)}
            className={cn(code === lang && "font-semibold text-[var(--gold)]")}
          >
            {LOCALE_META[code].nativeName}
            {code !== SOURCE_LOCALE && (
              <span className="ml-auto pl-3 text-xs text-muted-foreground">
                {LOCALE_META[code].label}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
