import { useMemo, useState } from "react";
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [villaFilter, setVillaFilter] = useState<VillaId | "all">("all");
  const [hideRejected, setHideRejected] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const fromDate = format(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const toDate = format(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: bookings = [], isLoading } = trpc.admin.bookings.calendar.useQuery({
    fromDate,
    toDate,
  });

  const { data: stats } = trpc.admin.bookings.stats.useQuery();

  const upcoming = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return bookings
      .filter(b => b.status === "confirmed" && b.checkInDate >= today)
      .slice(0, 5);
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--admin-fg)]">Календар</h1>
          <p className="text-[var(--admin-muted)]">Преглед на заетостта по вили</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="admin-stat-pill">
            <span className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Чакащи</span>
            <strong className="text-xl">{stats?.pending ?? 0}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="hide-rejected" checked={hideRejected} onCheckedChange={setHideRejected} />
            <Label htmlFor="hide-rejected" className="text-sm">
              Скрий отказани
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={villaFilter === "all" ? "default" : "outline"}
          className={cn(villaFilter === "all" && "admin-btn-primary")}
          onClick={() => setVillaFilter("all")}
        >
          Всички
        </Button>
        {VILLA_IDS.map(id => (
          <Button
            key={id}
            size="sm"
            variant={villaFilter === id ? "default" : "outline"}
            className={cn(villaFilter === id && "admin-btn-primary")}
            onClick={() => setVillaFilter(id)}
          >
            {VILLA_LABELS[id]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="admin-skeleton h-[520px] rounded-2xl" />
      ) : (
        <AdminCalendar
          bookings={bookings}
          villaFilter={villaFilter}
          hideRejected={hideRejected}
          month={month}
          onMonthChange={setMonth}
        />
      )}

      {upcoming.length > 0 && (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5">
          <h3 className="font-serif text-xl font-bold">Предстоящи настанявания</h3>
          <ul className="mt-3 space-y-2">
            {upcoming.map(b => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{b.guestName}</span>
                <span className="text-[var(--admin-muted)]">
                  {VILLA_LABELS[b.villaId as VillaId]} · {b.checkInDate} → {b.checkOutDate}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
