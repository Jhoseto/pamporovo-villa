import { useEffect, useMemo, useState } from "react";
import { VILLA_IDS, VILLA_LABELS, type VillaId } from "@shared/villas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Row = {
  villaId: VillaId;
  tierKey: string;
  tierLabel: string;
  winterPerNight: number;
  summerPerNight: number;
  sortOrder: number;
};

export default function AdminPricingPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, refetch } = trpc.admin.pricing.get.useQuery();
  const [rows, setRows] = useState<Row[]>([]);
  const [extras, setExtras] = useState<{ key: string; label: string; amountEur: number }[]>([]);

  useEffect(() => {
    if (data) {
      setRows(data.rows as Row[]);
      setExtras(data.extras.map(e => ({ key: e.key, label: e.label, amountEur: e.amountEur })));
    }
  }, [data]);

  const save = trpc.admin.pricing.update.useMutation({
    onSuccess: () => {
      toast.success("Цените са запазени");
      refetch();
      utils.content.getPricing.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const byVilla = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const id of VILLA_IDS) map[id] = [];
    for (const row of rows) {
      if (!map[row.villaId]) map[row.villaId] = [];
      map[row.villaId]!.push(row);
    }
    for (const id of VILLA_IDS) {
      map[id]!.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [rows]);

  const updateRow = (villaId: string, tierKey: string, patch: Partial<Row>) => {
    setRows(prev =>
      prev.map(r => (r.villaId === villaId && r.tierKey === tierKey ? { ...r, ...patch } : r))
    );
  };

  if (isLoading) return <div className="admin-skeleton h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Ценоразпис</h1>
        <p className="text-[var(--admin-muted)]">Цени за всяка вила — зима и лято</p>
      </div>

      <Tabs defaultValue={VILLA_IDS[0]}>
        <TabsList className="flex flex-wrap">
          {VILLA_IDS.map(id => (
            <TabsTrigger key={id} value={id}>
              {VILLA_LABELS[id]}
            </TabsTrigger>
          ))}
        </TabsList>

        {VILLA_IDS.map(villaId => (
          <TabsContent key={villaId} value={villaId} className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-hover)]">
                    <th className="p-3">Tier</th>
                    <th className="p-3">Зима €/нощ</th>
                    <th className="p-3">Лято €/нощ</th>
                  </tr>
                </thead>
                <tbody>
                  {(byVilla[villaId] ?? []).map(row => (
                    <tr key={row.tierKey} className="border-b border-[var(--admin-border)] last:border-0">
                      <td className="p-3">
                        <Input
                          value={row.tierLabel}
                          onChange={e => updateRow(villaId, row.tierKey, { tierLabel: e.target.value })}
                          className="admin-input"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.winterPerNight}
                          onChange={e =>
                            updateRow(villaId, row.tierKey, { winterPerNight: Number(e.target.value) })
                          }
                          className="admin-input w-24"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.summerPerNight}
                          onChange={e =>
                            updateRow(villaId, row.tierKey, { summerPerNight: Number(e.target.value) })
                          }
                          className="admin-input w-24"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5">
        <h3 className="font-serif text-xl font-bold">Допълнителни такси</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {extras.map((extra, i) => (
            <div key={extra.key} className="space-y-2">
              <Label>{extra.label}</Label>
              <Input
                type="number"
                value={extra.amountEur}
                onChange={e => {
                  const next = [...extras];
                  next[i] = { ...extra, amountEur: Number(e.target.value) };
                  setExtras(next);
                }}
                className="admin-input"
              />
            </div>
          ))}
        </div>
      </div>

      <Button className="admin-btn-primary" onClick={() => save.mutate({ rows, extras })} disabled={save.isPending}>
        Запази всички цени
      </Button>
    </div>
  );
}
