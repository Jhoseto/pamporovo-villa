import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useInView } from "framer-motion";
import { useLocation } from "wouter";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { formatPriceEur, VILLAS } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import {
  calculateStayPriceFromGrid,
  formatStayPriceBreakdown,
  type PricingGridRow,
} from "@/lib/pricing";
import { isSameCalendarDay, updateBookingDateRange } from "@/lib/bookingDates";
import { formatDateForApi } from "@/lib/scroll";
import { trackBookingSubmit } from "@/lib/analytics/events";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MagneticButton } from "./MagneticButton";
import { PremiumFormCard, PremiumFormField } from "./PremiumFormField";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

const premiumInputClass =
  "premium-input h-12 shadow-none focus-visible:border-[var(--gold)] focus-visible:ring-0";
const premiumTextareaClass =
  "premium-textarea shadow-none focus-visible:border-[var(--gold)] focus-visible:ring-0";
const premiumSelectClass =
  "premium-select h-12 w-full shadow-none focus-visible:ring-0 data-[size=default]:h-12";

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function isDateOccupied(
  date: Date,
  ranges: { checkInDate: string; checkOutDate: string }[]
): boolean {
  const key = formatDateForApi(date);
  return ranges.some(r => key >= r.checkInDate && key < r.checkOutDate);
}

/** True if any night in [from, to) is already occupied — catches ranges that span an occupied block. */
function rangeHasOccupiedNight(
  from: Date,
  to: Date,
  ranges: { checkInDate: string; checkOutDate: string }[]
): boolean {
  const fromKey = formatDateForApi(from);
  const toKey = formatDateForApi(to);
  return ranges.some(r => fromKey < r.checkOutDate && r.checkInDate < toKey);
}

export function BookingSection() {
  const [, setLocation] = useLocation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const calendarReady = useInView(sectionRef, { once: true, margin: "240px 0px" });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    villaId: VILLAS[0]?.id ?? "",
    numberOfGuests: 2,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestNote: "",
  });

  const { data: pricingData } = trpc.content.getPricing.useQuery();
  const { data: occupiedDates = [] } = trpc.booking.getOccupiedDates.useQuery({
    villaId: formData.villaId as "villa-1" | "villa-2" | "villa-deluxe",
  });

  const bookingMutation = trpc.booking.createRequest.useMutation();

  const pricingRows = (pricingData?.rows ?? []) as PricingGridRow[];

  // Switching villa loads a different occupancy set — drop a range that is no longer free.
  useEffect(() => {
    if (
      dateRange?.from &&
      dateRange?.to &&
      rangeHasOccupiedNight(dateRange.from, dateRange.to, occupiedDates)
    ) {
      setDateRange(undefined);
      toast.message("Избраните дати са заети за тази вила — моля, изберете нов период.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupiedDates]);

  const stayQuote = useMemo(() => {
    if (
      !pricingRows.length ||
      !dateRange?.from ||
      !dateRange?.to ||
      isSameCalendarDay(dateRange.from, dateRange.to)
    ) {
      return null;
    }

    return calculateStayPriceFromGrid(
      dateRange.from,
      dateRange.to,
      formData.villaId,
      pricingRows
    );
  }, [dateRange, formData.villaId, pricingRows]);

  /**
   * Hotel-style day availability [checkIn, checkOut): the checkout day of an
   * existing booking is free for a new check-in, and while the guest is picking
   * their end date, the check-in day of the NEXT booking is a valid checkout
   * (nights are counted from check-in up to the night before checkout).
   */
  const isDayBlocked = (date: Date): boolean => {
    const today = startOfDay(new Date());
    if (date < today) return true;

    const day = startOfDay(date);
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const to = dateRange?.to ? startOfDay(dateRange.to) : undefined;

    if (from && !to) {
      if (day.getTime() === from.getTime()) return false;
      // Candidate checkout: valid while no night in [from, day) is occupied.
      if (day > from) return rangeHasOccupiedNight(from, day, occupiedDates);
      return isDateOccupied(date, occupiedDates);
    }

    // Completed range: keep the chosen checkout clickable so it can be changed,
    // even when that day is the check-in of the next booking.
    if (to && day.getTime() === to.getTime()) return false;

    return isDateOccupied(date, occupiedDates);
  };

  /** Red strikethrough marking — skip days that are valid in the current selection context. */
  const isDayMarkedOccupied = (date: Date): boolean => {
    const today = startOfDay(new Date());
    if (date < today) return false;

    const day = startOfDay(date);
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const to = dateRange?.to ? startOfDay(dateRange.to) : undefined;

    if (from && !to && day > from && !rangeHasOccupiedNight(from, day, occupiedDates)) {
      return false;
    }
    if (to && day.getTime() === to.getTime()) return false;

    return isDateOccupied(date, occupiedDates);
  };

  const currentVillaName =
    VILLAS.find(v => v.id === formData.villaId)?.name ?? "тази вила";

  const handleCalendarSelect = (_range: DateRange | undefined, triggerDate: Date) => {
    // Occupied days stay clickable so we can explain instead of silently ignoring.
    if (isDayBlocked(triggerDate)) {
      toast.message(
        `Тази дата е заета за ${currentVillaName}. Сменете вилата от формата — възможно е друга да е свободна за същия период.`,
        { duration: 6000 }
      );
      return;
    }

    const nextRange = updateBookingDateRange(dateRange, triggerDate);

    if (
      nextRange?.from &&
      nextRange?.to &&
      isSameCalendarDay(nextRange.from, nextRange.to)
    ) {
      toast.error("Минимум една нощувка — настаняване и напускане не могат да са в един ден.");
      return;
    }

    if (
      nextRange?.from &&
      nextRange?.to &&
      rangeHasOccupiedNight(nextRange.from, nextRange.to, occupiedDates)
    ) {
      toast.message(
        `Периодът включва заети дати за ${currentVillaName}. Изберете свободен интервал или проверете друга вила.`,
        { duration: 6000 }
      );
      return;
    }

    setDateRange(nextRange);
  };

  const resetDates = () => {
    setDateRange(undefined);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Моля, изберете дати за настаняване и напускане.");
      return;
    }

    if (isSameCalendarDay(dateRange.from, dateRange.to)) {
      toast.error("Минимум една нощувка — настаняване и напускане не могат да са в един ден.");
      return;
    }

    if (rangeHasOccupiedNight(dateRange.from, dateRange.to, occupiedDates)) {
      toast.error("Избраният период включва заети дати за тази вила. Моля, изберете друг.");
      return;
    }

    try {
      await bookingMutation.mutateAsync({
        villaId: formData.villaId as "villa-1" | "villa-2" | "villa-deluxe",
        checkInDate: formatDateForApi(dateRange.from),
        checkOutDate: formatDateForApi(dateRange.to),
        numberOfGuests: formData.numberOfGuests,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        guestNote: formData.guestNote.trim() || undefined,
        websiteHoneypot: honeypot,
      });

      toast.success("Резервацията е изпратена успешно! Ще ви свържем скоро.");
      trackBookingSubmit(formData.villaId);
      resetDates();
      setFormData({
        villaId: VILLAS[0]?.id ?? "",
        numberOfGuests: 2,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        guestNote: "",
      });
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "";
      toast.error(
        message.includes("заети") || message.includes("припокрива")
          ? message
          : "Възникна грешка при изпращане на резервацията."
      );
    }
  };

  return (
    <SectionShell
      eyebrow="Резервация"
      title="Запазете своето място в планината"
      subtitle="Изберете вила и дати, оставете данните си — а ние ще се свържем лично за потвърждение"
      overlap
      splitTitle
      perfDefer
    >
      <div
        ref={sectionRef}
        className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-10"
      >
        <ScrollReveal direction="up">
          <PremiumFormCard title={`Изберете период за ${currentVillaName}`}>
            {calendarReady ? (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                min={2}
                disabled={date => date < startOfDay(new Date())}
                modifiers={{ occupied: isDayMarkedOccupied }}
                modifiersClassNames={{ occupied: "booking-calendar-day-occupied" }}
                classNames={{ today: "booking-calendar-day-today" }}
                className="booking-calendar mx-auto rounded-none bg-transparent p-0 [--cell-size:2.5rem]"
              />
            ) : (
              <div
                className="booking-calendar mx-auto flex min-h-[18rem] items-center justify-center p-0 [--cell-size:2.5rem]"
                aria-hidden
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)]/30 border-t-[var(--gold)]" />
              </div>
            )}
            {dateRange?.from && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={resetDates}
                  className="font-display text-xs uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Изчисти датите
                </button>
              </div>
            )}
            <p className="mt-6 font-display text-sm leading-relaxed tracking-wide text-muted-foreground">
              Кликнете начална и крайна дата· Минимум една нощувка
            </p>
            <p className="mt-2 font-display text-xs leading-relaxed tracking-wide text-muted-foreground">
              <span className="text-[oklch(0.55_0.09_25)] line-through">Зачертаните</span> дати са заети —
              проверете дали друга вила е свободна за същия период.
            </p>

            <div className="booking-price-quote mt-6">
              <p className="booking-price-quote-label">Цена</p>
              {stayQuote ? (
                <>
                  <p className="booking-price-quote-total">{formatPriceEur(stayQuote.total)}</p>
                  <p className="booking-price-quote-breakdown">
                    {formatStayPriceBreakdown(stayQuote)}
                  </p>
                  <p className="booking-price-quote-note">
                    Цяла вила · до 6 гости · без изхранване · тарифа „{stayQuote.tier.label.toLowerCase()}“
                  </p>
                </>
              ) : (
                <p className="booking-price-quote-empty">
                  {pricingRows.length
                    ? "Изберете дати за пристигане и напускане, за да видите цената."
                    : "Цените се зареждат..."}
                </p>
              )}
            </div>
          </PremiumFormCard>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={120}>
          <PremiumFormCard title="Данни за резервация">
            <form onSubmit={handleSubmit} className="space-y-8">
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

              <div className="grid gap-8 sm:grid-cols-2">
                <PremiumFormField label="Дата на пристигане" htmlFor="checkIn">
                  <Input
                    id="checkIn"
                    type="date"
                    className={premiumInputClass}
                    value={dateRange?.from ? formatDateForApi(dateRange.from) : ""}
                    readOnly
                    required
                  />
                </PremiumFormField>
                <PremiumFormField label="Дата на заминаване" htmlFor="checkOut">
                  <Input
                    id="checkOut"
                    type="date"
                    className={premiumInputClass}
                    value={dateRange?.to ? formatDateForApi(dateRange.to) : ""}
                    readOnly
                    required
                  />
                </PremiumFormField>
              </div>

              <div className="premium-form-divider" />

              <div className="grid gap-8 sm:grid-cols-2">
                <PremiumFormField label="Вила" htmlFor="villa">
                  <Select
                    value={formData.villaId}
                    onValueChange={value => setFormData(prev => ({ ...prev, villaId: value }))}
                  >
                    <SelectTrigger id="villa" className={premiumSelectClass}>
                      <SelectValue placeholder="Изберете вила" />
                    </SelectTrigger>
                    <SelectContent>
                      {VILLAS.map(villa => (
                        <SelectItem key={villa.id} value={villa.id}>
                          {villa.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PremiumFormField>

                <PremiumFormField label="Брой гости" htmlFor="guests">
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={6}
                    className={premiumInputClass}
                    value={formData.numberOfGuests}
                    onChange={event =>
                      setFormData(prev => ({
                        ...prev,
                        numberOfGuests: Number.parseInt(event.target.value, 10) || 1,
                      }))
                    }
                    required
                  />
                </PremiumFormField>
              </div>

              <div className="premium-form-divider" />

              <div className="grid gap-8 sm:grid-cols-2">
                <PremiumFormField label="Име" htmlFor="name">
                  <Input
                    id="name"
                    className={premiumInputClass}
                    value={formData.guestName}
                    onChange={event =>
                      setFormData(prev => ({ ...prev, guestName: event.target.value }))
                    }
                    required
                    minLength={2}
                  />
                </PremiumFormField>
                <PremiumFormField label="Имейл" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    className={premiumInputClass}
                    value={formData.guestEmail}
                    onChange={event =>
                      setFormData(prev => ({ ...prev, guestEmail: event.target.value }))
                    }
                    required
                  />
                </PremiumFormField>
              </div>

              <PremiumFormField label="Телефон" htmlFor="phone">
                <PhoneInput
                  id="phone"
                  className={premiumInputClass}
                  value={formData.guestPhone}
                  onChange={event =>
                    setFormData(prev => ({ ...prev, guestPhone: event.target.value }))
                  }
                  required
                  minLength={5}
                />
              </PremiumFormField>

              <PremiumFormField label="Бележка" htmlFor="requests">
                <Textarea
                  id="requests"
                  className={premiumTextareaClass}
                  value={formData.guestNote}
                  onChange={event =>
                    setFormData(prev => ({ ...prev, guestNote: event.target.value }))
                  }
                  placeholder="Напишете ако имате уточняваща информация към резервацията..."
                />
              </PremiumFormField>

              <label className="flex cursor-pointer items-start gap-3">
                <div className="relative mt-0.5 flex shrink-0">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[oklch(0_0_0/0.18)] bg-white transition checked:border-[var(--gold)] checked:bg-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/40"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    required
                  />
                  <svg
                    className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition peer-checked:opacity-100"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                </div>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  Запознах се и приемам{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/legal?tab=terms")}
                    className="font-medium text-foreground underline underline-offset-2 hover:text-[var(--gold)]"
                  >
                    Общите условия
                  </button>
                  ,{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/legal?tab=privacy")}
                    className="font-medium text-foreground underline underline-offset-2 hover:text-[var(--gold)]"
                  >
                    Политиката за поверителност
                  </button>{" "}
                  и правилата за ползване на вилата.
                </span>
              </label>

              <MagneticButton
                type="submit"
                className="premium-btn h-14 w-full text-base"
                disabled={bookingMutation.isPending || !pricingRows.length || !agreedToTerms}
              >
                {bookingMutation.isPending ? "Изпращане..." : "Изпрати резервация"}
              </MagneticButton>
            </form>
          </PremiumFormCard>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
