import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Phone, ArrowLeft, Copy, MessageCircle, Printer } from "lucide-react";
import { AdminBookingPrintSheet } from "@/components/admin/AdminBookingPrintSheet";
import { GuestNameWithVip } from "@/components/admin/ContactVipBadge";
import { BookingConfirmDialog } from "@/components/admin/BookingConfirmDialog";
import { BookingConfirmationSendPanel } from "@/components/admin/BookingConfirmationSendPanel";
import { BookingPaymentEditor } from "@/components/admin/BookingPaymentEditor";
import { BookingForm, type BookingFormValues } from "@/components/admin/BookingForm";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { VILLAS, formatPriceEur } from "@/data/siteContent";
import { calculateStayPriceFromGrid, type PricingGridRow } from "@/lib/pricing";
import { bookingStatusLabel, bookingSourceLabel, type BookingStatusKey } from "@/lib/adminLabels";
import { copyBookingSummary, formatBookingSummary, whatsAppUrl } from "@/lib/adminBooking";
import { bookingBalanceDue } from "@shared/bookingPayment";
import type { ConfirmationCardData } from "@/lib/confirmationCardImage";
import { VILLA_LABELS, type VillaId } from "@shared/villas";

export default function AdminBookingDetailPage() {
  const [, params] = useRoute("/admin/bookings/:id");
  const id = Number(params?.id);
  const utils = trpc.useUtils();

  const { data: booking, isLoading, isError } = trpc.admin.bookings.getById.useQuery(
    { id },
    { enabled: Number.isFinite(id) && id > 0 }
  );
  const { data: pricingData } = trpc.content.getPricing.useQuery();

  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [values, setValues] = useState<BookingFormValues | null>(null);
  const [paymentTotal, setPaymentTotal] = useState("");
  const [paymentDeposit, setPaymentDeposit] = useState("");

  const quote = useMemo(() => {
    if (!booking || !pricingData?.rows) return null;
    return calculateStayPriceFromGrid(
      new Date(booking.checkInDate),
      new Date(booking.checkOutDate),
      booking.villaId,
      pricingData.rows as PricingGridRow[]
    );
  }, [booking, pricingData]);

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
        status: (booking.status === "rejected" ? "pending" : booking.status) as BookingFormValues["status"],
      });
      setPaymentTotal(
        booking.totalAmountEur != null
          ? String(booking.totalAmountEur)
          : quote
            ? String(quote.total)
            : ""
      );
      setPaymentDeposit(String(booking.depositPaidEur ?? 0));
    }
  }, [booking, quote]);

  const update = trpc.admin.bookings.update.useMutation({
    onSuccess: res => {
      toast.success(res.emailSent ? "Запазено и изпратен имейл за потвърждение" : "Запазено");
      setEditing(false);
      utils.admin.bookings.getById.invalidate({ id });
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.stats.invalidate();
      utils.admin.bookings.overview.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const confirm = trpc.admin.bookings.confirm.useMutation({
    onSuccess: res => {
      toast.success(res.emailSent ? "Потвърдена и изпратен имейл" : "Потвърдена");
      setConfirmOpen(false);
      utils.admin.bookings.getById.invalidate({ id });
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.stats.invalidate();
      utils.admin.bookings.overview.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const reject = trpc.admin.bookings.reject.useMutation({
    onSuccess: () => {
      toast.success("Отказана");
      utils.admin.bookings.getById.invalidate({ id });
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.stats.invalidate();
      utils.admin.bookings.overview.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="admin-glass-card mx-auto max-w-lg p-6 text-center">
        <p className="text-[var(--admin-muted)]">Невалиден номер на резервация.</p>
        <Link href="/admin/bookings" className="mt-4 inline-block text-sm underline">
          Към резервациите
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="admin-skeleton h-64 rounded-2xl" />;
  }

  if (isError || !booking || !values) {
    return (
      <div className="admin-glass-card mx-auto max-w-lg p-6 text-center">
        <p className="text-[var(--admin-muted)]">Резервацията не е намерена.</p>
        <Link href="/admin/bookings" className="mt-4 inline-block text-sm underline">
          Към резервациите
        </Link>
      </div>
    );
  }

  const villaName = VILLAS.find(v => v.id === booking.villaId)?.name ?? booking.villaId;
  const busy = update.isPending || confirm.isPending || reject.isPending;
  const isConfirmedLike = booking.status === "confirmed" || booking.status === "completed";
  const cardData: ConfirmationCardData | null =
    isConfirmedLike && booking.totalAmountEur != null
      ? {
          bookingId: booking.id,
          guestName: booking.guestName,
          villaId: booking.villaId,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          nights: quote?.nights ?? 0,
          numberOfGuests: booking.numberOfGuests,
          totalAmountEur: booking.totalAmountEur,
          depositPaidEur: booking.depositPaidEur ?? 0,
        }
      : null;

  return (
    <>
      <AdminBookingPrintSheet booking={booking} quote={quote} />

      <BookingConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        bookingId={booking.id}
        guestName={booking.guestName}
        villaId={booking.villaId}
        checkInDate={booking.checkInDate}
        checkOutDate={booking.checkOutDate}
        numberOfGuests={booking.numberOfGuests}
        nights={quote?.nights ?? 0}
        suggestedTotal={quote?.total ?? null}
        busy={confirm.isPending}
        onConfirm={payment => confirm.mutate({ id, ...payment })}
      />

      <div className="no-print mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
      >
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <GuestNameWithVip
            name={booking.guestName}
            isVip={booking.guestIsVip}
            className="font-serif text-3xl font-bold"
          />
          <p className="text-[var(--admin-muted)]">
            {villaName} · {booking.checkInDate} → {booking.checkOutDate}
          </p>
          <span className={`admin-status admin-status--${booking.status} mt-2 inline-block`}>
            {bookingStatusLabel(booking.status)}
          </span>
        </div>
        {booking.guestPhone && (
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${booking.guestPhone}`}
              className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
            >
              <Phone className="h-4 w-4" /> Обади се
            </a>
            <a
              href={whatsAppUrl(booking.guestPhone, formatBookingSummary(booking))}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-glass-btn inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Button
              type="button"
              variant="outline"
              className="admin-glass-btn"
              onClick={async () => {
                try {
                  await copyBookingSummary(booking);
                  toast.success("Копирано в клипборда");
                } catch {
                  toast.error("Неуспешно копиране");
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Копирай резюме
            </Button>
            <Button type="button" variant="outline" className="admin-glass-btn" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Печат
            </Button>
          </div>
        )}
        {!booking.guestPhone && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="admin-glass-btn"
              onClick={async () => {
                try {
                  await copyBookingSummary(booking);
                  toast.success("Копирано в клипборда");
                } catch {
                  toast.error("Неуспешно копиране");
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Копирай резюме
            </Button>
            <Button type="button" variant="outline" className="admin-glass-btn" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Печат
            </Button>
          </div>
        )}
      </div>

      {quote && !isConfirmedLike && (
        <div className="admin-glass-card admin-quote-card rounded-xl p-4">
          <p className="text-sm text-[var(--admin-muted)]">Изчислена цена</p>
          <p className="font-serif text-2xl font-bold">{formatPriceEur(quote.total)}</p>
          <p className="text-sm text-[var(--admin-muted)]">{quote.nights} нощувки</p>
        </div>
      )}

      {isConfirmedLike && (
        <>
          <BookingPaymentEditor
            bookingId={booking.id}
            totalAmountEur={booking.totalAmountEur ?? null}
            depositPaidEur={booking.depositPaidEur ?? null}
            suggestedTotal={quote?.total ?? null}
            onSaved={() => utils.admin.bookings.getById.invalidate({ id })}
          />
          {cardData && (
            <BookingConfirmationSendPanel
              bookingId={booking.id}
              guestPhone={booking.guestPhone}
              guestEmail={booking.guestEmail}
              cardData={cardData}
            />
          )}
        </>
      )}

      <div className="admin-glass-card p-6">
        {editing ? (
          <>
            <BookingForm
              values={values}
              onChange={setValues}
              guestOptional
              showStatus={booking.status !== "rejected"}
              showCompletedStatus={booking.status === "confirmed" || booking.status === "completed"}
            />
            {values.status === "confirmed" && booking.status !== "confirmed" && (
              <div className="mt-4 grid gap-4 rounded-xl border border-[var(--admin-glass-border-subtle)] p-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-sm text-[var(--admin-muted)]">
                  При промяна на статус към „Потвърдена“ въведете плащането.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="edit-pay-total">
                    Обща сума (€)
                  </label>
                  <input
                    id="edit-pay-total"
                    type="number"
                    min={0}
                    className="admin-input w-full rounded-xl border px-3 py-2"
                    value={paymentTotal}
                    onChange={e => setPaymentTotal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="edit-pay-deposit">
                    Капаро (€)
                  </label>
                  <input
                    id="edit-pay-deposit"
                    type="number"
                    min={0}
                    className="admin-input w-full rounded-xl border px-3 py-2"
                    value={paymentDeposit}
                    onChange={e => setPaymentDeposit(e.target.value)}
                  />
                </div>
                {paymentTotal && paymentDeposit && (
                  <p className="sm:col-span-2 text-sm">
                    Остава:{" "}
                    <strong className="text-[#c9a24d]">
                      {formatPriceEur(
                        bookingBalanceDue(Number(paymentTotal), Number(paymentDeposit)) ?? 0
                      )}
                    </strong>
                  </p>
                )}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                className="admin-btn-primary"
                disabled={busy}
                onClick={() => {
                  const becomingConfirmed =
                    booking.status !== "confirmed" && values.status === "confirmed";
                  const totalNum = Number(paymentTotal);
                  const depositNum = Number(paymentDeposit);
                  if (becomingConfirmed) {
                    if (!Number.isFinite(totalNum) || !Number.isFinite(depositNum)) {
                      toast.error("Въведете обща сума и капаро");
                      return;
                    }
                    if (depositNum > totalNum) {
                      toast.error("Капарото не може да надвишава общата сума");
                      return;
                    }
                  }
                  update.mutate({
                    id,
                    ...values,
                    status:
                      booking.status === "rejected"
                        ? "rejected"
                        : values.status,
                    guestEmail: values.guestEmail || undefined,
                    guestPhone: values.guestPhone || undefined,
                    totalAmountEur: becomingConfirmed ? totalNum : undefined,
                    depositPaidEur: becomingConfirmed ? depositNum : undefined,
                  });
                }}
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
              <dd className="font-medium">{bookingSourceLabel(booking.source as "website" | "manual")}</dd>
            </div>
            <div>
              <dt className="text-[var(--admin-muted)]">Имейл</dt>
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
            <Button className="admin-btn-primary" disabled={busy} onClick={() => setConfirmOpen(true)}>
              Потвърди
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => reject.mutate({ id })}>
              Откажи
            </Button>
          </>
        )}
        {booking.status === "confirmed" && (
          <Button variant="destructive" disabled={busy} onClick={() => reject.mutate({ id, adminNote: booking.adminNote ?? undefined })}>
            Отмени резервацията
          </Button>
        )}
      </div>
      </div>
    </>
  );
}
