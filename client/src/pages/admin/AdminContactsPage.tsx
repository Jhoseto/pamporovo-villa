import { Link } from "wouter";
import { useEffect, useState } from "react";
import { ContactRound, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { GuestNameWithVip } from "@/components/admin/ContactVipBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 50;

type ContactItem = {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  isVip: boolean;
  stats: {
    total: number;
    completed: number;
    rejected: number;
    confirmed: number;
    pending: number;
    lastCheckIn: string | null;
  };
};

function statPill(label: string, value: number, className?: string) {
  if (value === 0) return null;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", className)}>
      {label}: {value}
    </span>
  );
}

export default function AdminContactsPage() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ContactItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setOffset(0);
    setItems([]);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = trpc.admin.contacts.list.useQuery({
    search: debouncedSearch.trim() || undefined,
    offset,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (!data) return;
    setItems(prev => (offset === 0 ? data.items : [...prev, ...data.items]));
  }, [data, offset]);

  const importMutation = trpc.admin.contacts.importFromBookings.useMutation({
    onSuccess: res => {
      toast.success(
        res.created > 0 ? `Добавени ${res.created} контакта от резервации` : "Няма нови контакти за импорт"
      );
      utils.admin.contacts.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const hasMore = data?.hasMore ?? false;
  const total = data?.total;

  return (
    <div className="space-y-6">
      <div className="admin-page-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Контакти</h1>
          <p>Визитки на клиенти и история на резервациите им</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="admin-glass-btn"
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", importMutation.isPending && "animate-spin")} />
            Импорт от резервации
          </Button>
          <Button asChild className="admin-btn-primary">
            <Link href="/admin/contacts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Нов контакт
            </Link>
          </Button>
        </div>
      </div>

      <input
        className="admin-input w-full max-w-md rounded-xl border px-4 py-2"
        placeholder="Търсене по име или телефон (+359, 0…)"
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
          <div className="p-10 text-center">
            <ContactRound className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-[var(--admin-muted)]">Няма контакти</p>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              Добавете ръчно или импортирайте от съществуващи резервации
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--admin-glass-border-subtle)]">
            {items.map(contact => (
              <Link
                key={contact.id}
                href={`/admin/contacts/${contact.id}`}
                className="admin-list-row flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <GuestNameWithVip name={contact.fullName} isVip={contact.isVip} className="font-semibold" />
                  <p className="text-sm text-[var(--admin-muted)]">
                    {[contact.phone, contact.email].filter(Boolean).join(" · ") || "Без телефон и имейл"}
                  </p>
                  {contact.stats.lastCheckIn && (
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      Последно настаняване: {contact.stats.lastCheckIn}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[var(--admin-glass-bg)] px-2.5 py-1 text-xs font-medium">
                    {contact.stats.total} рез.
                  </span>
                  {statPill("Гостували", contact.stats.completed, "admin-status admin-status--completed")}
                  {statPill("Потвърдени", contact.stats.confirmed, "admin-status admin-status--confirmed")}
                  {statPill("Чакащи", contact.stats.pending, "admin-status admin-status--pending")}
                  {statPill("Отказани", contact.stats.rejected, "admin-status admin-status--rejected")}
                </div>
              </Link>
            ))}
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
