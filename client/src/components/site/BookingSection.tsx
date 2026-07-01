import { useMemo, useState, type FormEvent } from "react";
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
    } catch {
      toast.error("Възникна грешка при изпращане на резервацията.");
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
              disabled={date => {
                if (date < startOfDay(new Date())) return true;
                return isDateOccupied(date, occupiedDates);
              }}
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
