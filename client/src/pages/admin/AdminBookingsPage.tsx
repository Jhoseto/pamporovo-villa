import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { VILLAS } from "@/data/siteContent";

const tabs = [
  { key: undefined, label: "Всички" },
  { key: "pending" as const, label: "Чакащи" },
  { key: "confirmed" as const, label: "Потвърдени" },
  { key: "rejected" as const, label: "Отказани" },
];

export default function AdminBookingsPage() {
  const [status, setStatus] = useState<"pending" | "confirmed" | "rejected" | undefined>();
  const [search, setSearch] = useState("");

  const { data: bookings = [], isLoading } = trpc.admin.bookings.list.useQuery({
    status,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Заявки</h1>
          <p className="text-[var(--admin-muted)]">Всички резервации от сайта и ръчни</p>
        </div>
        <Link href="/admin/bookings/new">
          <Button className="admin-btn-primary">+ Нова резервация</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <Button
            key={tab.label}
            size="sm"
            variant={status === tab.key ? "default" : "outline"}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <input
        className="admin-input w-full max-w-md rounded-xl border px-4 py-2"
        placeholder="Търсене по име или телефон..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
        {isLoading ? (
          <div className="admin-skeleton h-40" />
        ) : bookings.length === 0 ? (
          <p className="p-8 text-center text-[var(--admin-muted)]">Няма заявки</p>
        ) : (
          <div className="divide-y divide-[var(--admin-border)]">
            {bookings.map(b => {
              const villa = VILLAS.find(v => v.id === b.villaId)?.name ?? b.villaId;
              return (
                <Link key={b.id} href={`/admin/bookings/${b.id}`}>
                  <a className="flex flex-col gap-2 p-4 transition hover:bg-[var(--admin-hover)] md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{b.guestName}</p>
                      <p className="text-sm text-[var(--admin-muted)]">
                        {villa} · {b.checkInDate} → {b.checkOutDate} · {b.numberOfGuests} гости
                      </p>
                    </div>
                    <span className={`admin-status admin-status--${b.status}`}>{b.status}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
