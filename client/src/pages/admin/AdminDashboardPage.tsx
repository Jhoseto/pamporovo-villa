import { useMemo, useState } from "react";
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { AdminBlockDatesPanel } from "@/components/admin/AdminBlockDatesPanel";
import { AdminCalendar, type CalendarBooking } from "@/components/admin/AdminCalendar";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { type BookingStatusKey } from "@/lib/adminLabels";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { cn } from "@/lib/utils";

const statusTabs: { key: BookingStatusKey | undefined; label: string }[] = [
  { key: undefined, label: "Всички" },
  { key: "pending", label: "Чакащи" },
  { key: "confirmed", label: "Потвърдени" },
  { key: "completed", label: "Гостували" },
  { key: "rejected", label: "Отказани" },
];

export default function AdminDashboardPage() {
  const [villaFilter, setVillaFilter] = useState<VillaId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatusKey | undefined>();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const fromDate = format(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const toDate = format(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data, isLoading } = trpc.admin.bookings.calendar.useQuery(
    { fromDate, toDate },
    { staleTime: 0 }
  );

  const calendarEvents = useMemo((): CalendarBooking[] => {
    const bookings = data?.bookings ?? [];
    const blocks = (data?.blocks ?? []).map(
      (block): CalendarBooking => ({
        id: -block.id,
        villaId: block.villaId,
        checkInDate: block.startDate,
        checkOutDate: block.endDate,
        guestName: block.note?.trim() || "Блокирано",
        status: "blocked",
      })
    );
    return [...bookings, ...blocks];
  }, [data]);

  return (
    <div className="space-y-6">
      <AdminDashboardOverview />

      <div className="admin-page-header">
        <div>
          <h1>Календар</h1>
          <p>Преглед на заетостта по вили</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map(tab => (
          <Button
            key={tab.label}
            size="sm"
            variant={statusFilter === tab.key ? "default" : "outline"}
            className={cn("admin-chip", statusFilter === tab.key && "admin-chip--active")}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={villaFilter === "all" ? "default" : "outline"}
          className={cn("admin-chip", villaFilter === "all" && "admin-chip--active")}
          onClick={() => setVillaFilter("all")}
        >
          Всички
        </Button>
        {VILLA_IDS.map(id => (
          <Button
            key={id}
            size="sm"
            variant={villaFilter === id ? "default" : "outline"}
            className={cn("admin-chip", villaFilter === id && "admin-chip--active")}
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
          bookings={calendarEvents}
          villaFilter={villaFilter}
          statusFilter={statusFilter}
          month={month}
          onMonthChange={setMonth}
        />
      )}

      <AdminBlockDatesPanel />
    </div>
  );
}
