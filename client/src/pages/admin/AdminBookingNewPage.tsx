import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookingForm, type BookingFormValues } from "@/components/admin/BookingForm";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { VILLAS } from "@/data/siteContent";
import type { VillaId } from "@shared/villas";

export default function AdminBookingNewPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [values, setValues] = useState<BookingFormValues>({
    villaId: (VILLAS[0]?.id ?? "villa-1") as VillaId,
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 2,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestNote: "",
    adminNote: "",
    status: "confirmed",
  });

  const create = trpc.admin.bookings.create.useMutation({
    onSuccess: res => {
      toast.success(res.emailSent ? "Резервацията е създадена и изпратен имейл" : "Резервацията е създадена");
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.stats.invalidate();
      setLocation(`/admin/bookings/${res.id}`);
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex text-sm text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
      >
        ← Към резервациите
      </Link>
      <div className="admin-page-header">
        <h1 className="font-serif text-3xl font-semibold">Нова резервация</h1>
      </div>
      <div className="admin-glass-card p-6">
        <BookingForm values={values} onChange={setValues} guestOptional />
        <Button
          className="admin-btn-primary mt-6"
          onClick={() => {
            if (!values.guestName.trim() || !values.checkInDate || !values.checkOutDate) {
              toast.error("Попълнете име, настаняване и напускане");
              return;
            }
            create.mutate({
              ...values,
              status: values.status === "completed" ? "confirmed" : values.status,
              guestEmail: values.guestEmail || undefined,
              guestPhone: values.guestPhone || undefined,
              guestNote: values.guestNote || undefined,
              adminNote: values.adminNote || undefined,
            });
          }}
          disabled={create.isPending}
        >
          Запази
        </Button>
      </div>
    </div>
  );
}
