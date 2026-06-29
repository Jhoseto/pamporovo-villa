import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function AdminBlockDatesPanel() {
  const utils = trpc.useUtils();
  const today = new Date().toISOString().slice(0, 10);
  const [villaId, setVillaId] = useState<VillaId>("villa-1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const { data: blocks = [], isLoading } = trpc.admin.blockedDates.list.useQuery({
    fromDate: today,
  });

  const create = trpc.admin.blockedDates.create.useMutation({
    onSuccess: () => {
      toast.success("Периодът е блокиран");
      setStartDate("");
      setEndDate("");
      setNote("");
      utils.admin.blockedDates.list.invalidate();
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.overview.invalidate();
      utils.booking.getOccupiedDates.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.blockedDates.delete.useMutation({
    onSuccess: () => {
      toast.success("Блокирането е премахнато");
      utils.admin.blockedDates.list.invalidate();
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.overview.invalidate();
      utils.booking.getOccupiedDates.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="admin-glass-card p-5">
      <h3 className="font-serif text-xl font-semibold">Блокиране на период</h3>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">
        Затворете дати за ремонт или лично ползване — няма да се приемат резервации.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="block-villa">Вила</Label>
          <select
            id="block-villa"
            value={villaId}
            onChange={e => setVillaId(e.target.value as VillaId)}
            className="admin-input w-full rounded-xl border px-3 py-2 text-sm"
          >
            {VILLA_IDS.map(id => (
              <option key={id} value={id}>
                {VILLA_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-start">От</Label>
          <Input
            id="block-start"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-end">До</Label>
          <Input
            id="block-end"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="block-note">Бележка (по избор)</Label>
          <Input
            id="block-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ремонт, лично..."
            className="admin-input"
          />
        </div>
      </div>

      <Button
        className="admin-btn-primary mt-4"
        disabled={!startDate || !endDate || create.isPending}
        onClick={() =>
          create.mutate({
            villaId,
            startDate,
            endDate,
            note: note.trim() || undefined,
          })
        }
      >
        Блокирай периода
      </Button>

      <div className="mt-6 border-t border-[var(--admin-glass-border-subtle)] pt-4">
        <h4 className="text-sm font-semibold">Активни блокировки</h4>
        {isLoading ? (
          <div className="admin-skeleton mt-3 h-12 rounded-xl" />
        ) : blocks.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--admin-muted)]">Няма блокирани периоди напред</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {blocks.map(block => (
              <li
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--admin-glass-border-subtle)] px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{VILLA_LABELS[block.villaId as VillaId]}</span>
                  <span className="mx-2 text-[var(--admin-muted)]">·</span>
                  <span>
                    {block.startDate} → {block.endDate}
                  </span>
                  {block.note && (
                    <span className="ml-2 text-[var(--admin-muted)]">({block.note})</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[var(--admin-muted)] hover:text-red-600"
                  onClick={() => {
                    if (!window.confirm("Премахване на блокирането?")) return;
                    remove.mutate({ id: block.id });
                  }}
                  disabled={remove.isPending}
                  aria-label="Премахни блокиране"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
