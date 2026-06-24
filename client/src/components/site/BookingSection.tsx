import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { VILLAS } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { formatDateForApi } from "@/lib/scroll";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MagneticButton } from "./MagneticButton";
import { SectionShell } from "./SectionShell";
import { ScrollReveal } from "./ScrollReveal";

export function BookingSection() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    villaId: VILLAS[0]?.id ?? "",
    numberOfGuests: 2,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });

  const bookingMutation = trpc.booking.createRequest.useMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Моля, изберете дати за настаняване и напускане.");
      return;
    }

    if (dateRange.to <= dateRange.from) {
      toast.error("Датата на заминаване трябва да е след датата на пристигане.");
      return;
    }

    try {
      const selectedVilla = VILLAS.find(v => v.id === formData.villaId);
      const villaNote = selectedVilla ? `Избрана вила: ${selectedVilla.name}` : "";
      const combinedRequests = [villaNote, formData.specialRequests.trim()]
        .filter(Boolean)
        .join("\n\n");

      await bookingMutation.mutateAsync({
        checkInDate: formatDateForApi(dateRange.from),
        checkOutDate: formatDateForApi(dateRange.to),
        numberOfGuests: formData.numberOfGuests,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        specialRequests: combinedRequests || undefined,
      });

      toast.success("Резервацията е изпратена успешно! Ще ви свържем скоро.");
      setDateRange(undefined);
      setFormData({
        villaId: VILLAS[0]?.id ?? "",
        numberOfGuests: 2,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        specialRequests: "",
      });
    } catch {
      toast.error("Възникна грешка при изпращане на резервацията.");
    }
  };

  return (
    <SectionShell
      id="booking"
      eyebrow="Резервация"
      title="Резервирайте вашата почивка"
      subtitle="Изберете вила, дати и попълнете данните — ще се свържем с вас за потвърждение"
      splitTitle
    >
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[360px_1fr]">
        <ScrollReveal direction="left">
          <Card className="floating-card p-4">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Изберете период</p>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
              className="rounded-md"
            />
          </Card>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={120}>
          <Card className="floating-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkIn">Дата на пристигане</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={dateRange?.from ? formatDateForApi(dateRange.from) : ""}
                    readOnly
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Дата на заминаване</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={dateRange?.to ? formatDateForApi(dateRange.to) : ""}
                    readOnly
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="villa">Вила</Label>
                <Select
                  value={formData.villaId}
                  onValueChange={value => setFormData(prev => ({ ...prev, villaId: value }))}
                >
                  <SelectTrigger id="villa" className="w-full">
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
              </div>

              <div>
                <Label htmlFor="guests">Брой гости</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={6}
                  value={formData.numberOfGuests}
                  onChange={event =>
                    setFormData(prev => ({
                      ...prev,
                      numberOfGuests: Number.parseInt(event.target.value, 10) || 1,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Име</Label>
                  <Input
                    id="name"
                    value={formData.guestName}
                    onChange={event => setFormData(prev => ({ ...prev, guestName: event.target.value }))}
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.guestEmail}
                    onChange={event => setFormData(prev => ({ ...prev, guestEmail: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={event => setFormData(prev => ({ ...prev, guestPhone: event.target.value }))}
                  required
                  minLength={5}
                />
              </div>

              <div>
                <Label htmlFor="requests">Специални пожелания</Label>
                <Textarea
                  id="requests"
                  value={formData.specialRequests}
                  onChange={event =>
                    setFormData(prev => ({ ...prev, specialRequests: event.target.value }))
                  }
                  placeholder="Напишете всякакви специални пожелания..."
                />
              </div>

              <MagneticButton
                type="submit"
                className="premium-btn w-full"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? "Изпращане..." : "Изпрати резервация"}
              </MagneticButton>
            </form>
          </Card>
        </ScrollReveal>
      </div>
    </SectionShell>
  );
}
