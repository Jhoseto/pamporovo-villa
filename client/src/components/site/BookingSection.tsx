import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
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

  const handleCalendarSelect = (_range: DateRange | undefined, triggerDate: Date) => {
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
      toast.error("Периодът включва вече заети дати за тази вила. Изберете свободен интервал.");
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
      id="booking"
      eyebrow="Резервация"
      title="Запазете своето място в планината"
      subtitle="Изберете вила и дати, оставете данните си — а ние ще се свържем лично за потвърждение"
      overlap
      splitTitle
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-10">
        <ScrollReveal direction="up">
          <PremiumFormCard title="Изберете период">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={1}
              min={2}
              disabled={isDayBlocked}
              modifiers={{ occupied: isDayMarkedOccupied }}
              modifiersClassNames={{ occupied: "booking-calendar-day-occupied" }}
              classNames={{ today: "booking-calendar-day-today" }}
              className="booking-calendar mx-auto rounded-none bg-transparent p-0 [--cell-size:2.5rem]"
            />
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

              <MagneticButton
                type="submit"
                className="premium-btn h-14 w-full text-base"
                disabled={bookingMutation.isPending || !pricingRows.length}
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
