import { useState } from "react";
import { useLocation } from "wouter";
import { BookingForm, type BookingFormValues } from "@/components/admin/BookingForm";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { VILLAS } from "@/data/siteContent";
import type { VillaId } from "@shared/villas";

export default function AdminBookingNewPage() {
  const [, setLocation] = useLocation();
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
      toast.success("Резервацията е създадена");
      setLocation(`/admin/bookings/${res.id}`);
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-serif text-3xl font-bold">Нова резервация</h1>
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        <BookingForm values={values} onChange={setValues} guestOptional />
        <Button
          className="admin-btn-primary mt-6"
          onClick={() =>
            create.mutate({
              ...values,
              guestEmail: values.guestEmail || undefined,
              guestPhone: values.guestPhone || undefined,
              guestNote: values.guestNote || undefined,
              adminNote: values.adminNote || undefined,
            })
          }
          disabled={create.isPending}
        >
          Запази
        </Button>
      </div>
    </div>
  );
}
