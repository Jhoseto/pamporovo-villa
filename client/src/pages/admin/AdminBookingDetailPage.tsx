import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Phone, ArrowLeft } from "lucide-react";
import { BookingForm, type BookingFormValues } from "@/components/admin/BookingForm";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { VILLAS, formatPriceEur } from "@/data/siteContent";
import { calculateStayPriceFromGrid, type PricingGridRow } from "@/lib/pricing";
import { VILLA_LABELS, type VillaId } from "@shared/villas";

export default function AdminBookingDetailPage() {
  const [, params] = useRoute("/admin/bookings/:id");
  const id = Number(params?.id);
  const utils = trpc.useUtils();

  const { data: booking, isLoading } = trpc.admin.bookings.getById.useQuery(
    { id },
    { enabled: Number.isFinite(id) }
  );
  const { data: pricingData } = trpc.content.getPricing.useQuery();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<BookingFormValues | null>(null);

  useEffect(() => {
    if (booking) {
      setValues({
        villaId: booking.villaId as VillaId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        numberOfGuests: booking.numberOfGuests,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail ?? "",
        guestPhone: booking.guestPhone ?? "",
        guestNote: booking.guestNote ?? "",
        adminNote: booking.adminNote ?? "",
        status: booking.status === "rejected" ? "pending" : booking.status,
      });
    }
  }, [booking]);

  const quote = useMemo(() => {
    if (!booking || !pricingData?.rows) return null;
    return calculateStayPriceFromGrid(
      new Date(booking.checkInDate),
      new Date(booking.checkOutDate),
      booking.villaId,
      pricingData.rows as PricingGridRow[]
    );
  }, [booking, pricingData]);

  const update = trpc.admin.bookings.update.useMutation({
    onSuccess: () => {
      toast.success("Запазено");
      setEditing(false);
      utils.admin.bookings.getById.invalidate({ id });
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.calendar.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const confirm = trpc.admin.bookings.confirm.useMutation({
    onSuccess: () => {
      toast.success("Потвърдена");
      utils.admin.bookings.getById.invalidate({ id });
    },
    onError: err => toast.error(err.message),
  });

  const reject = trpc.admin.bookings.reject.useMutation({
    onSuccess: () => {
      toast.success("Отказана");
      utils.admin.bookings.getById.invalidate({ id });
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading || !booking || !values) {
    return <div className="admin-skeleton h-64 rounded-2xl" />;
  }

  const villaName = VILLAS.find(v => v.id === booking.villaId)?.name ?? booking.villaId;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/bookings">
        <a className="inline-flex items-center gap-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-fg)]">
          <ArrowLeft className="h-4 w-4" /> Назад
        </a>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">{booking.guestName}</h1>
          <p className="text-[var(--admin-muted)]">
            {villaName} · {booking.checkInDate} → {booking.checkOutDate}
          </p>
          <span className={`admin-status admin-status--${booking.status} mt-2 inline-block`}>
            {booking.status}
          </span>
        </div>
        {booking.guestPhone && (
          <a href={`tel:${booking.guestPhone}`} className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
            <Phone className="h-4 w-4" /> Обади се
          </a>
        )}
      </div>

      {quote && (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-sm text-[var(--admin-muted)]">Изчислена цена</p>
          <p className="font-serif text-2xl font-bold">{formatPriceEur(quote.total)}</p>
          <p className="text-sm text-[var(--admin-muted)]">{quote.nights} нощувки</p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        {editing ? (
          <>
            <BookingForm
              values={values}
              onChange={setValues}
              guestOptional
              showStatus={booking.status !== "rejected"}
            />
            <div className="mt-4 flex gap-2">
              <Button
                className="admin-btn-primary"
                onClick={() =>
                  update.mutate({
                    id,
                    ...values,
                    status: booking.status === "rejected" ? "rejected" : values.status,
                    guestEmail: values.guestEmail || undefined,
                    guestPhone: values.guestPhone || undefined,
                  })
                }
              >
                Запази промените
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Отказ
              </Button>
            </div>
          </>
        ) : (
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-[var(--admin-muted)]">Вила</dt>
              <dd className="font-medium">{VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId}</dd>
            </div>
            <div>
              <dt className="text-[var(--admin-muted)]">Източник</dt>
              <dd className="font-medium">{booking.source}</dd>
            </div>
            <div>
              <dt className="text-[var(--admin-muted)]">Email</dt>
              <dd>{booking.guestEmail || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--admin-muted)]">Телефон</dt>
              <dd>{booking.guestPhone || "—"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-[var(--admin-muted)]">Бележка от гост</dt>
              <dd>{booking.guestNote || "—"}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-[var(--admin-muted)]">Админ бележка</dt>
              <dd>{booking.adminNote || "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Редактирай
          </Button>
        )}
        {booking.status === "pending" && (
          <>
            <Button className="admin-btn-primary" onClick={() => confirm.mutate({ id })}>
              Потвърди
            </Button>
            <Button variant="destructive" onClick={() => reject.mutate({ id })}>
              Откажи
            </Button>
          </>
        )}
        {booking.status === "confirmed" && (
          <Button variant="destructive" onClick={() => reject.mutate({ id, adminNote: booking.adminNote ?? undefined })}>
            Отмени резервацията
          </Button>
        )}
      </div>
    </div>
  );
}
