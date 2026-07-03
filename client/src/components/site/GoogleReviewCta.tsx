import { ExternalLink, Star } from "lucide-react";
import { GBP } from "@shared/gbpLinks";
import { gbpUi } from "@shared/gbpUi";
import { usePageLang } from "@/hooks/usePageLang";
import { trackGoogleReviewClick } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const BANNER_COPY = {
  bg: {
    eyebrow: "Google отзиви",
    title: "Харесахте престоя? Споделете в Google",
    body: "Отзивите в Google Business Profile помагат на други гости да ни открият в Пампорово. Отнема под минута.",
    maps: "Вижте в Google Maps",
  },
  en: {
    eyebrow: "Google reviews",
    title: "Enjoyed your stay? Share on Google",
    body: "Google Business Profile reviews help other guests find us in Pamporovo. It takes under a minute.",
    maps: "View on Google Maps",
  },
} as const;

type GoogleReviewCtaProps = {
  source: string;
  variant?: "banner" | "compact";
  className?: string;
};

export function GoogleReviewCta({ source, variant = "banner", className }: GoogleReviewCtaProps) {
  const lang = usePageLang();
  const gbp = gbpUi(lang);
  const t = BANNER_COPY[lang];

  const handleClick = () => trackGoogleReviewClick(source);

  if (variant === "compact") {
    return (
      <a
        href={GBP.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-4 py-2 text-sm font-medium text-foreground transition hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/14",
          className
        )}
      >
        <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
        {gbp.reviewLink}
        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
      </a>
    );
  }

  return (
    <div
      className={cn(
        "google-review-cta rounded-2xl border border-[var(--gold)]/20 bg-gradient-to-br from-[var(--gold)]/6 via-white to-white p-5 md:p-6",
        className
      )}
    >
      <p className="eyebrow mb-2 text-[var(--gold)]">{t.eyebrow}</p>
      <h3 className="font-serif text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {t.title}
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
        {t.body}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={GBP.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="premium-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Star className="h-4 w-4 fill-current" />
          {gbp.reviewLink}
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
        <a
          href={GBP.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 transition hover:text-[var(--gold)] hover:underline"
        >
          {t.maps}
        </a>
      </div>
    </div>
  );
}
