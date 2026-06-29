import { SITE, formatPriceEur } from "@/data/siteContent";
import { bookingSourceLabel, bookingStatusLabel, type BookingStatusKey } from "@/lib/adminLabels";
import { VILLA_LABELS, type VillaId } from "@shared/villas";

type Props = {
  booking: {
    id: number;
    villaId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    guestName: string;
    guestEmail?: string | null;
    guestPhone?: string | null;
    guestNote?: string | null;
    adminNote?: string | null;
    status: BookingStatusKey;
    source: "website" | "manual";
    createdAt?: Date | string;
  };
  quote?: { total: number; nights: number } | null;
};

function formatDateTime(value: Date | string | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("bg-BG");
}

export function AdminBookingPrintSheet({ booking, quote }: Props) {
  const villa = VILLA_LABELS[booking.villaId as VillaId] ?? booking.villaId;

  return (
    <div className="admin-booking-print-sheet hidden print:block">
      <header className="admin-booking-print-header">
        <img src={SITE.logo} alt={SITE.name} className="admin-booking-print-logo" />
        <div>
          <p className="admin-booking-print-eyebrow">Резервация #{booking.id}</p>
          <h1>{booking.guestName}</h1>
          <p>{SITE.location}</p>
        </div>
      </header>

      <div className="admin-booking-print-meta">
        <span className={`admin-status admin-status--${booking.status}`}>
          {bookingStatusLabel(booking.status)}
        </span>
        <span>{bookingSourceLabel(booking.source)}</span>
        <span>Създадена: {formatDateTime(booking.createdAt)}</span>
      </div>

      <table className="admin-booking-print-table">
        <tbody>
          <tr>
            <th>Вила</th>
            <td>{villa}</td>
          </tr>
          <tr>
            <th>Настаняване</th>
            <td>{booking.checkInDate}</td>
          </tr>
          <tr>
            <th>Напускане</th>
            <td>{booking.checkOutDate}</td>
          </tr>
          <tr>
            <th>Гости</th>
            <td>{booking.numberOfGuests}</td>
          </tr>
          <tr>
            <th>Имейл</th>
            <td>{booking.guestEmail || "—"}</td>
          </tr>
          <tr>
            <th>Телефон</th>
            <td>{booking.guestPhone || "—"}</td>
          </tr>
          {quote && (
            <>
              <tr>
                <th>Нощувки</th>
                <td>{quote.nights}</td>
              </tr>
              <tr>
                <th>Изчислена цена</th>
                <td>{formatPriceEur(quote.total)}</td>
              </tr>
            </>
          )}
          <tr>
            <th>Бележка от гост</th>
            <td>{booking.guestNote || "—"}</td>
          </tr>
          <tr>
            <th>Админ бележка</th>
            <td>{booking.adminNote || "—"}</td>
          </tr>
        </tbody>
      </table>

      <footer className="admin-booking-print-footer">
        <p>{SITE.name} · {SITE.email}</p>
        <p>Отпечатано: {new Date().toLocaleString("bg-BG")}</p>
      </footer>
    </div>
  );
}
