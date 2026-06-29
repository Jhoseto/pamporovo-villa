import { VILLAS } from "@/data/siteContent";
import type { VillaId } from "@shared/villas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { BookingStatusKey } from "@/lib/adminLabels";

export type BookingFormValues = {
  villaId: VillaId;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestNote: string;
  adminNote: string;
  status: "pending" | "confirmed" | "completed";
};

type Props = {
  values: BookingFormValues;
  onChange: (values: BookingFormValues) => void;
  showStatus?: boolean;
  showCompletedStatus?: boolean;
  guestOptional?: boolean;
};

export function BookingForm({
  values,
  onChange,
  showStatus = true,
  showCompletedStatus = false,
  guestOptional = false,
}: Props) {
  const set = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label>Вила</Label>
        <Select value={values.villaId} onValueChange={v => set("villaId", v as VillaId)}>
          <SelectTrigger className="admin-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VILLAS.map(v => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Настаняване</Label>
        <Input
          type="date"
          value={values.checkInDate}
          onChange={e => set("checkInDate", e.target.value)}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label>Напускане</Label>
        <Input
          type="date"
          value={values.checkOutDate}
          onChange={e => set("checkOutDate", e.target.value)}
          className="admin-input"
        />
      </div>

      <div className="space-y-2">
        <Label>Гости</Label>
        <Input
          type="number"
          min={1}
          max={10}
          value={values.numberOfGuests}
          onChange={e => set("numberOfGuests", Number(e.target.value))}
          className="admin-input"
        />
      </div>

      {showStatus && (
        <div className="space-y-2">
          <Label>Статус</Label>
          <Select value={values.status} onValueChange={v => set("status", v as BookingFormValues["status"])}>
            <SelectTrigger className="admin-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Потвърдена</SelectItem>
              {showCompletedStatus && <SelectItem value="completed">Гостували</SelectItem>}
              <SelectItem value="pending">Непотвърдена</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2 md:col-span-2">
        <Label>Име на гост</Label>
        <Input value={values.guestName} onChange={e => set("guestName", e.target.value)} className="admin-input" />
      </div>

      <div className="space-y-2">
        <Label>Имейл{guestOptional ? " (по избор)" : ""}</Label>
        <Input
          type="email"
          value={values.guestEmail}
          onChange={e => set("guestEmail", e.target.value)}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label>Телефон{guestOptional ? " (по избор)" : ""}</Label>
        <PhoneInput value={values.guestPhone} onChange={e => set("guestPhone", e.target.value)} className="admin-input" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Бележка от гост</Label>
        <Textarea value={values.guestNote} onChange={e => set("guestNote", e.target.value)} className="admin-input min-h-[80px]" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Админ бележка</Label>
        <Textarea value={values.adminNote} onChange={e => set("adminNote", e.target.value)} className="admin-input min-h-[80px]" />
      </div>
    </div>
  );
}
