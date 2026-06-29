import { VILLA_LABELS, type VillaId } from "@shared/villas";
import { bookingSourceLabel, bookingStatusLabel, type BookingStatusKey } from "@/lib/adminLabels";

export type BookingExportRow = {
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
  guestIsVip?: boolean;
  status: BookingStatusKey;
  source: "website" | "manual";
  createdAt?: Date | string;
};

function escapeCsvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatCreatedAt(value: Date | string | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("bg-BG");
}

export function bookingsToCsv(rows: BookingExportRow[]): string {
  const headers = [
    "ID",
    "Гост",
    "Вила",
    "Настаняване",
    "Напускане",
    "Гости",
    "Статус",
    "Източник",
    "Имейл",
    "Телефон",
    "Бележка гост",
    "Админ бележка",
    "VIP",
    "Създадена",
  ];

  const lines = rows.map(row =>
    [
      row.id,
      row.guestName,
      VILLA_LABELS[row.villaId as VillaId] ?? row.villaId,
      row.checkInDate,
      row.checkOutDate,
      row.numberOfGuests,
      bookingStatusLabel(row.status),
      bookingSourceLabel(row.source),
      row.guestEmail ?? "",
      row.guestPhone ?? "",
      row.guestNote ?? "",
      row.adminNote ?? "",
      row.guestIsVip ? "Да" : "",
      formatCreatedAt(row.createdAt),
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [headers.map(escapeCsvCell).join(","), ...lines].join("\r\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportBookingsCsv(rows: BookingExportRow[], filenamePrefix = "rezervacii") {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`${filenamePrefix}-${stamp}.csv`, bookingsToCsv(rows));
}
