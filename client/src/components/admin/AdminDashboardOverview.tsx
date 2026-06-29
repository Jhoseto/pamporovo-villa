import { Link } from "wouter";
import { Moon } from "lucide-react";
import { useEffect, useRef } from "react";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { GuestNameWithVip } from "@/components/admin/ContactVipBadge";
import { type BookingStatusKey } from "@/lib/adminLabels";
import { trpc } from "@/lib/trpc";

function BookingMiniList({
  title,
  items,
  empty,
}: {
  title: string;
  items: {
    id: number;
    guestName: string;
    guestIsVip?: boolean;
    villaId: string;
    checkInDate: string;
    checkOutDate: string;
    status: BookingStatusKey;
  }[];
  empty: string;
}) {
  return (
    <div className="admin-glass-card p-4">
      <h3 className="text-sm font-semibold text-[var(--admin-fg)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--admin-muted)]">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map(item => (
            <li key={item.id}>
              <Link
                href={`/admin/bookings/${item.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-[var(--admin-hover)]"
              >
                <GuestNameWithVip name={item.guestName} isVip={item.guestIsVip} className="font-medium" />
                <span className="text-xs text-[var(--admin-muted)]">
                  {VILLA_LABELS[item.villaId as VillaId]?.split(" ").pop()} ·{" "}
                  {item.checkInDate === item.checkOutDate ? item.checkInDate : `${item.checkInDate} → ${item.checkOutDate}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminDashboardOverview() {
  const { data, isLoading } = trpc.admin.bookings.overview.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const runReminders = trpc.admin.bookings.runDailyReminders.useMutation();
  const remindersStarted = useRef(false);

  useEffect(() => {
    if (remindersStarted.current) return;
    remindersStarted.current = true;
    runReminders.mutate();
  }, [runReminders]);

  if (isLoading) {
    return <div className="admin-skeleton h-48 rounded-2xl" />;
  }

  if (!data) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold">Днес и седмицата</h2>
          <p className="text-sm text-[var(--admin-muted)]">
            {data.today} — следващите 7 нощи до {data.weekEnd}
          </p>
        </div>
        {data.pending > 0 && (
          <Link
            href="/admin/bookings"
            className="admin-badge inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
          >
            {data.pending} чакащи резервации
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BookingMiniList
          title="Настаняване днес"
          items={data.checkInsToday}
          empty="Няма настанявания"
        />
        <BookingMiniList
          title="Настаняване утре"
          items={data.checkInsTomorrow}
          empty="Няма настанявания"
        />
        <BookingMiniList
          title="Напускане днес"
          items={data.checkOutsToday}
          empty="Няма напускания"
        />
        <BookingMiniList
          title="Напускане утре"
          items={data.checkOutsTomorrow}
          empty="Няма напускания"
        />
      </div>

      <div className="admin-glass-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Moon className="h-4 w-4 text-[var(--admin-muted)]" />
          <h3 className="text-sm font-semibold">Свободни нощи (7 дни)</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {VILLA_IDS.map(id => (
            <div
              key={id}
              className="flex items-center justify-between rounded-xl border border-[var(--admin-glass-border-subtle)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--admin-muted)]">{VILLA_LABELS[id]}</span>
              <strong>{data.emptyNightsByVilla[id]} / 7</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
