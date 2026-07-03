import { useState, type FormEvent } from "react";
import { REVIEW_BODY_MAX } from "@shared/reviewLimits";
import { GBP } from "@shared/gbpLinks";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { trackGoogleReviewClick, trackReviewSubmit } from "@/lib/analytics/events";
import { useTranslation } from "@/contexts/LocaleContext";
import { interpolate, useVillasLocalized } from "@/i18n/contentHooks";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagneticButton } from "./MagneticButton";
import { GoogleReviewCta } from "./GoogleReviewCta";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { ScrollReveal } from "./ScrollReveal";
import { SectionShell } from "./SectionShell";

const fieldClass =
  "review-form-field h-10 text-sm shadow-none focus-visible:border-[var(--gold)] focus-visible:ring-0";
const textareaClass =
  "review-form-textarea min-h-[5.5rem] resize-y text-sm shadow-none focus-visible:border-[var(--gold)] focus-visible:ring-0";

function StarRatingInput({
  value,
  onChange,
  starLabel,
}: {
  value: number;
  onChange: (rating: number) => void;
  starLabel: (star: number) => string;
}) {
  return (
    <div className="flex h-10 items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          aria-label={starLabel(star)}
          className="rounded p-0.5 transition hover:scale-110"
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "h-4 w-4",
              star <= value ? "fill-[var(--gold)] text-[var(--gold)]" : "text-foreground/20"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const { t } = useTranslation();
  const villas = useVillasLocalized();
  const { data: reviews = [], isLoading } = trpc.content.getReviews.useQuery();
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    rating: 5,
    body: "",
    villaId: "",
    stayPeriod: "",
  });

  const submitReview = trpc.content.submitReview.useMutation({
    onSuccess: data => {
      toast.success(data.message, {
        description: t("gbp.reviewToast", "Споделете и в Google — помага на други гости да ни открият."),
        duration: 8000,
        action: {
          label: t("gbp.reviewToastAction", "Google отзив"),
          onClick: () => {
            trackGoogleReviewClick("review_submit_toast");
            window.open(GBP.reviewUrl, "_blank", "noopener,noreferrer");
          },
        },
      });
      trackReviewSubmit();
      setForm({
        guestName: "",
        guestEmail: "",
        rating: 5,
        body: "",
        villaId: "",
        stayPeriod: "",
      });
    },
    onError: err => toast.error(err.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitReview.mutate({
      guestName: form.guestName,
      guestEmail: form.guestEmail || undefined,
      rating: form.rating,
      body: form.body,
      villaId: form.villaId
        ? (form.villaId as "villa-1" | "villa-2" | "villa-deluxe")
        : undefined,
      stayPeriod: form.stayPeriod || undefined,
      websiteHoneypot: honeypot,
    });
  };

  return (
    <SectionShell
      eyebrow={t("home.reviews.eyebrow", "Отзиви")}
      title={t("home.reviews.title", "Какво казват нашите гости")}
      subtitle={t("home.reviews.subtitle", "Истински впечатления от хора, които вече са спали край боровете ни")}
      overlap
      splitTitle
      perfDefer
    >
      <div className="reviews-section-inner w-full space-y-10 md:space-y-12">
        <ScrollReveal direction="up">
          <ReviewsCarousel reviews={reviews} isLoading={isLoading} />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={60}>
          <GoogleReviewCta source="reviews_section" className="mx-auto max-w-3xl" />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <div className="review-form-panel">
            <div className="review-form-panel-head">
              <h3 className="review-form-panel-title">{t("home.reviews.formTitle", "Споделете вашия опит")}</h3>
              
            </div>

            <form onSubmit={handleSubmit} className="review-form-grid">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden
              />

              <label className="review-form-label">
                <span>{t("reviews.form.name", "Име")}</span>
                <Input
                  id="review-name"
                  className={fieldClass}
                  value={form.guestName}
                  onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                  required
                  minLength={2}
                  maxLength={255}
                  placeholder={t("reviews.form.namePlaceholder", "Вашето име")}
                />
              </label>

              <label className="review-form-label">
                <span>{t("reviews.form.email", "Имейл")}</span>
                <Input
                  id="review-email"
                  type="email"
                  className={fieldClass}
                  value={form.guestEmail}
                  onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                  placeholder={t("reviews.form.emailPlaceholder", "по избор")}
                />
              </label>

              <label className="review-form-label">
                <span>{t("reviews.form.rating", "Оценка")}</span>
                <StarRatingInput
                  value={form.rating}
                  onChange={rating => setForm(f => ({ ...f, rating }))}
                  starLabel={star =>
                    interpolate(t("reviews.form.ratingAria", "{star} звезди"), {
                      star: String(star),
                    })
                  }
                />
              </label>

              <label className="review-form-label">
                <span>{t("reviews.form.villa", "Вила")}</span>
                <Select
                  value={form.villaId || "none"}
                  onValueChange={v => setForm(f => ({ ...f, villaId: v === "none" ? "" : v }))}
                >
                  <SelectTrigger id="review-villa" className={cn(fieldClass, "w-full")}>
                    <SelectValue placeholder={t("reviews.form.villaPlaceholder", "Изберете")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("reviews.form.villaUnknown", "Не съм сигурен/а")}</SelectItem>
                    {villas.map(villa => (
                      <SelectItem key={villa.id} value={villa.id}>
                        {villa.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="review-form-label">
                <span>{t("reviews.form.period", "Период")}</span>
                <Input
                  id="review-period"
                  className={fieldClass}
                  placeholder={t("reviews.form.periodPlaceholder", "напр. Март 2025")}
                  value={form.stayPeriod}
                  onChange={e => setForm(f => ({ ...f, stayPeriod: e.target.value }))}
                  maxLength={128}
                />
              </label>

              <label className="review-form-label review-form-label--wide">
                <span>{t("reviews.form.body", "Вашият отзив")}</span>
                <Textarea
                  id="review-body"
                  className={textareaClass}
                  value={form.body}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      body: e.target.value.slice(0, REVIEW_BODY_MAX),
                    }))
                  }
                  required
                  minLength={10}
                  maxLength={REVIEW_BODY_MAX}
                  rows={3}
                  placeholder={t("reviews.form.bodyPlaceholder", "Какво запомнихте от престоя си при нас...")}
                />
                <p className="mt-1.5 text-right text-[0.6875rem] tabular-nums text-muted-foreground">
                  {form.body.length}/{REVIEW_BODY_MAX}
                </p>
              </label>

              <div className="review-form-actions">
                <MagneticButton
                  type="submit"
                  className="premium-btn review-form-submit"
                  disabled={submitReview.isPending}
                >
                  {submitReview.isPending
                    ? t("reviews.form.submitting", "Изпращане...")
                    : t("reviews.form.submit", "Изпрати отзив")}
                </MagneticButton>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
