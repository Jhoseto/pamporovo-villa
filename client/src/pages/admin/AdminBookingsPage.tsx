import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestNameWithVip } from "@/components/admin/ContactVipBadge";
import { trpc } from "@/lib/trpc";
import { VILLAS } from "@/data/siteContent";
import { cn } from "@/lib/utils";
import { bookingStatusLabel, type BookingStatusKey } from "@/lib/adminLabels";
import { exportBookingsCsv } from "@/lib/adminExport";
import { toast } from "sonner";

const PAGE_SIZE = 50;

const tabs: { key: BookingStatusKey | undefined; label: string }[] = [
  { key: undefined, label: "Всички" },
  { key: "pending", label: "Чакащи" },
  { key: "confirmed", label: "Потвърдени" },
  { key: "completed", label: "Гостували" },
  { key: "rejected", label: "Отказани" },
];

type BookingItem = {
  id: number;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guestName: string;
  guestIsVip?: boolean;
  status: BookingStatusKey;
};

export default function AdminBookingsPage() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<BookingStatusKey | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setOffset(0);
    setItems([]);
  }, [status, debouncedSearch, fromDate, toDate]);

  const listFilters = {
    status,
    search: debouncedSearch.trim() || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const { data, isLoading, isFetching } = trpc.admin.bookings.list.useQuery({
    ...listFilters,
    offset,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (!data) return;
    setItems(prev => (offset === 0 ? data.items : [...prev, ...data.items]));
  }, [data, offset]);

  const hasMore = data?.hasMore ?? false;
  const total = data?.total;

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await utils.admin.bookings.exportList.fetch(listFilters);
      if (rows.length === 0) {
        toast.info("Няма резултати за експорт");
        return;
      }
      exportBookingsCsv(rows);
      toast.success(`Експортирани ${rows.length} резервации`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Грешка при експорт");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Резервации</h1>
          <p>Всички резервации от сайта и ръчни</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="admin-glass-btn"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Експорт..." : "CSV експорт"}
          </Button>
          <Button asChild className="admin-btn-primary">
            <Link href="/admin/bookings/new">+ Нова резервация</Link>
          </Button>
        </div>
      </div>

      <div className="admin-glass-card p-4">
        <p className="text-sm font-medium text-[var(--admin-fg)]">Филтри за списъка и експорта</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-from">Настаняване от</Label>
            <Input
              id="filter-from"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-to">Настаняване до</Label>
            <Input
              id="filter-to"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <Button
            key={tab.label}
            size="sm"
            variant={status === tab.key ? "default" : "outline"}
            className={cn("admin-chip", status === tab.key && "admin-chip--active")}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <input
        className="admin-input w-full max-w-md rounded-xl border px-4 py-2"
        placeholder="Търсене по име или телефон..."
        aria-label="Търсене по име или телефон"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {total != null && (
        <p className="text-sm text-[var(--admin-muted)]">
          Показани {items.length} от {total}
        </p>
      )}

      <div className="admin-glass-card admin-glass-card--static overflow-hidden">
        {isLoading && offset === 0 ? (
          <div className="admin-skeleton h-40" />
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-[var(--admin-muted)]">Няма резервации</p>
        ) : (
          <div className="divide-y divide-[var(--admin-glass-border-subtle)]">
            {items.map(b => {
              const villa = VILLAS.find(v => v.id === b.villaId)?.name ?? b.villaId;
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="admin-list-row flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <GuestNameWithVip name={b.guestName} isVip={b.guestIsVip} className="font-semibold" />
                    <p className="text-sm text-[var(--admin-muted)]">
                      {villa} · {b.checkInDate} → {b.checkOutDate} · {b.numberOfGuests} гости
                    </p>
                  </div>
                  <span className={`admin-status admin-status--${b.status}`}>
                    {bookingStatusLabel(b.status)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="admin-glass-btn"
            onClick={() => setOffset(prev => prev + PAGE_SIZE)}
            disabled={isFetching}
          >
            {isFetching ? "Зареждане..." : "Зареди още"}
          </Button>
        </div>
      )}
    </div>
  );
}
