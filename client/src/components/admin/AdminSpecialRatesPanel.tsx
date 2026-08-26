import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { formatPriceEur } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SpecialRateRow = {
  id: number;
  villaId: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  label: string | null;
};

export function AdminSpecialRatesPanel() {
  const utils = trpc.useUtils();
  const today = new Date().toISOString().slice(0, 10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [villaId, setVillaId] = useState<VillaId>("villa-1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [label, setLabel] = useState("");

  const { data: rates = [], isLoading } = trpc.admin.specialRates.list.useQuery({
    fromDate: today,
  });

  const resetForm = () => {
    setEditingId(null);
    setVillaId("villa-1");
    setStartDate("");
    setEndDate("");
    setPricePerNight("");
    setLabel("");
  };

  const startEdit = (rate: SpecialRateRow) => {
    setEditingId(rate.id);
    setVillaId(rate.villaId as VillaId);
    setStartDate(rate.startDate);
    setEndDate(rate.endDate);
    setPricePerNight(String(rate.pricePerNight));
    setLabel(rate.label ?? "");
  };

  const invalidateRates = () => {
    utils.admin.specialRates.list.invalidate();
    utils.content.getPricing.invalidate();
  };

  const create = trpc.admin.specialRates.create.useMutation({
    onSuccess: () => {
      toast.success("Специалната цена е добавена");
      resetForm();
      invalidateRates();
    },
    onError: err => toast.error(err.message),
  });

  const update = trpc.admin.specialRates.update.useMutation({
    onSuccess: () => {
      toast.success("Специалната цена е обновена");
      resetForm();
      invalidateRates();
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.specialRates.delete.useMutation({
    onSuccess: () => {
      toast.success("Специалната цена е премахната");
      if (editingId != null) resetForm();
      invalidateRates();
    },
    onError: err => toast.error(err.message),
  });

  const isEditing = editingId != null;
  const isSaving = create.isPending || update.isPending;
  const canSubmit = Boolean(startDate && endDate && pricePerNight);

  const handleSubmit = () => {
    const payload = {
      villaId,
      startDate,
      endDate,
      pricePerNight: Number(pricePerNight) || 0,
      label: label.trim() || undefined,
    };

    if (isEditing) {
      update.mutate({ id: editingId, ...payload });
      return;
    }

    create.mutate(payload);
  };

  return (
    <div className="admin-glass-card p-5">
      <h3 className="font-serif text-xl font-semibold">Специални цени за период</h3>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">
        Задайте фиксирана цена €/нощ за определени дати и вила — напр. Коледа, Нова година, Великден.
        „До“ е денят на напускане; последната нощ е денят преди „До“.
      </p>

      {isEditing && (
        <p className="mt-3 rounded-xl border border-[var(--admin-gold-border)] bg-[var(--admin-gold-light)] px-3 py-2 text-sm text-[var(--admin-fg)]">
          Редактирате период #{editingId}. Запазете промените или отменете.
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="special-villa">Вила</Label>
          <select
            id="special-villa"
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
          <Label htmlFor="special-start">От</Label>
          <Input
            id="special-start"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="special-end">До</Label>
          <Input
            id="special-end"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="special-price">€/нощ</Label>
          <Input
            id="special-price"
            type="number"
            min={0}
            value={pricePerNight}
            onChange={e => setPricePerNight(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="special-label">Етикет (по избор)</Label>
          <Input
            id="special-label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Коледа, Нова година..."
            className="admin-input"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className="admin-btn-primary"
          disabled={!canSubmit || isSaving}
          onClick={handleSubmit}
        >
          {isEditing ? "Запази промените" : "Добави специална цена"}
        </Button>
        {isEditing && (
          <Button variant="outline" className="admin-glass-btn" disabled={isSaving} onClick={resetForm}>
            Отмени
          </Button>
        )}
      </div>

      <div className="mt-6 border-t border-[var(--admin-glass-border-subtle)] pt-4">
        <h4 className="text-sm font-semibold">Активни специални периоди</h4>
        {isLoading ? (
          <div className="admin-skeleton mt-3 h-12 rounded-xl" />
        ) : rates.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--admin-muted)]">Няма зададени специални цени напред</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rates.map(rate => (
              <li
                key={rate.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm",
                  editingId === rate.id
                    ? "border-[var(--admin-gold-border)] bg-[var(--admin-gold-light)]"
                    : "border-[var(--admin-glass-border-subtle)]"
                )}
              >
                <div>
                  <span className="font-medium">{VILLA_LABELS[rate.villaId as VillaId]}</span>
                  <span className="mx-2 text-[var(--admin-muted)]">·</span>
                  <span>
                    {rate.startDate} → {rate.endDate}
                  </span>
                  <span className="mx-2 text-[var(--admin-muted)]">·</span>
                  <span>{formatPriceEur(rate.pricePerNight)}/нощ</span>
                  {rate.label && (
                    <span className="ml-2 text-[var(--admin-muted)]">({rate.label})</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                    onClick={() => startEdit(rate)}
                    disabled={isSaving}
                    aria-label="Редактирай специална цена"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--admin-muted)] hover:text-red-600"
                    onClick={() => {
                      if (!window.confirm("Премахване на специалната цена?")) return;
                      remove.mutate({ id: rate.id });
                    }}
                    disabled={remove.isPending}
                    aria-label="Премахни специална цена"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
