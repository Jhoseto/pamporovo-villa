import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { bg } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { type BookingStatusKey } from "@/lib/adminLabels";
import { cn } from "@/lib/utils";

export type CalendarBooking = {
  id: number;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestIsVip?: boolean;
  status: BookingStatusKey | "blocked";
};

type Props = {
  bookings: CalendarBooking[];
  villaFilter: VillaId | "all";
  statusFilter?: BookingStatusKey;
  month: Date;
  onMonthChange: (month: Date) => void;
};

const VILLA_COLORS: Record<VillaId, string> = {
  "villa-1": "var(--villa-1)",
  "villa-2": "var(--villa-2)",
  "villa-deluxe": "var(--villa-deluxe)",
};

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function isPastBooking(checkOut: string) {
  return checkOut < todayStr();
}

function statusClass(status: CalendarBooking["status"], past: boolean) {
  if (status === "blocked") return "admin-cal-event--blocked";
  if (status === "completed") return "admin-cal-event--completed";
  if (past) return "admin-cal-event--past";
  if (status === "confirmed") return "admin-cal-event--confirmed";
  if (status === "pending") return "admin-cal-event--pending";
  return "admin-cal-event--rejected";
}

function CalendarEventChip({
  event,
  day,
  className,
}: {
  event: CalendarBooking;
  day: Date;
  className?: string;
}) {
  const past = event.status !== "blocked" && isPastBooking(event.checkOutDate);
  const villaColor = VILLA_COLORS[event.villaId as VillaId] ?? "var(--admin-accent)";
  const label = `${VILLA_LABELS[event.villaId as VillaId]?.split(" ")[1] ?? event.villaId} · ${event.guestName}${event.guestIsVip ? " · VIP" : ""}`;
  const title = `${VILLA_LABELS[event.villaId as VillaId] ?? event.villaId} · ${event.guestName}${event.guestIsVip ? " (VIP)" : ""}`;
  const styles = cn(
    "admin-cal-event block truncate rounded-md px-1.5 py-1 text-[10px] md:text-xs",
    statusClass(event.status, past),
    className
  );
  const borderStyle = { borderLeft: `3px solid ${villaColor}` };

  if (event.status === "blocked") {
    return (
      <span key={`block-${event.id}-${day.toISOString()}`} className={styles} style={borderStyle} title={title}>
        {label}
      </span>
    );
  }

  return (
    <Link
      key={`${event.id}-${day.toISOString()}`}
      href={`/admin/bookings/${event.id}`}
      className={styles}
      style={borderStyle}
      title={title}
    >
      {label}
    </Link>
  );
}

function CalendarDayEvents({
  dayEvents,
  day,
  villaFilter,
}: {
  dayEvents: CalendarBooking[];
  day: Date;
  villaFilter: VillaId | "all";
}) {
  const maxVisible = villaFilter === "all" ? 3 : 2;
  const visible = dayEvents.slice(0, maxVisible);
  const overflow = dayEvents.slice(maxVisible);

  return (
    <>
      {visible.map(event => (
        <CalendarEventChip key={`${event.id}-${day.toISOString()}`} event={event} day={day} />
      ))}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium text-[var(--admin-accent)] hover:bg-[var(--admin-glass)]"
            >
              +{overflow.length} още
            </button>
          </PopoverTrigger>
          <PopoverContent className="admin-glass-card w-56 p-2" align="start">
            <div className="space-y-1">
              {overflow.map(event => (
                <CalendarEventChip
                  key={`overflow-${event.id}-${day.toISOString()}`}
                  event={event}
                  day={day}
                  className="px-2 py-1.5 text-xs"
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}

export function AdminCalendar({ bookings, villaFilter, statusFilter, month, onMonthChange }: Props) {
  const cursor = month;

  const visibleBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter) {
        if (b.status !== statusFilter) return false;
      } else if (b.status === "rejected") {
        return false;
      }
      if (villaFilter !== "all" && b.villaId !== villaFilter) return false;
      return true;
    });
  }, [bookings, villaFilter, statusFilter]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsForDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return visibleBookings.filter(b => key >= b.checkInDate && key < b.checkOutDate);
  };

  return (
    <div className="admin-calendar-card admin-glass-card admin-glass-card--static overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-glass-border-subtle)] px-4 py-4 md:px-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold capitalize text-[var(--admin-fg)]">
            {format(cursor, "LLLL yyyy", { locale: bg })}
          </h2>
          <p className="text-sm text-[var(--admin-muted)]">Заетост по вили</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="admin-glass-btn" onClick={() => onMonthChange(addDays(startOfMonth(cursor), -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="admin-glass-btn" onClick={() => onMonthChange(startOfMonth(new Date()))}>
            Днес
          </Button>
          <Button variant="outline" size="icon" className="admin-glass-btn" onClick={() => onMonthChange(addDays(endOfMonth(cursor), 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="admin-cal-legend flex flex-wrap gap-3 px-4 py-3 md:px-6">
        <span className="admin-cal-legend-item admin-cal-event--pending">Непотвърдена</span>
        <span className="admin-cal-legend-item admin-cal-event--confirmed">Потвърдена</span>
        <span className="admin-cal-legend-item admin-cal-event--completed">Гостували</span>
        <span className="admin-cal-legend-item admin-cal-event--rejected">Отказана</span>
        <span className="admin-cal-legend-item admin-cal-event--blocked">Блокирано</span>
      </div>

      <div className="grid grid-cols-7 border-t border-[var(--admin-glass-border-subtle)] text-center text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map(d => (
          <div key={d} className="border-b border-[var(--admin-glass-border-subtle)] py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map(day => {
          const dayEvents = eventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, cursor);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "admin-cal-day min-h-[88px] border-b border-r border-[var(--admin-glass-border-subtle)] p-1.5 md:min-h-[110px] md:p-2",
                !inMonth && "admin-cal-day--outside"
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday && "admin-cal-today"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                <CalendarDayEvents dayEvents={dayEvents} day={day} villaFilter={villaFilter} />
              </div>
            </div>
          );
        })}
      </div>

      {villaFilter === "all" && (
        <div className="flex flex-wrap gap-4 border-t border-[var(--admin-glass-border-subtle)] px-4 py-3 text-xs text-[var(--admin-muted)] md:px-6">
          {VILLA_IDS.map(id => (
            <span key={id} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: VILLA_COLORS[id] }} />
              {VILLA_LABELS[id]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
