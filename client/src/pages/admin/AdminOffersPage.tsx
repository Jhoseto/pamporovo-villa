import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatPriceEur } from "@/data/siteContent";

export default function AdminOffersPage() {
  const utils = trpc.useUtils();
  const { data: offers = [], refetch } = trpc.admin.offers.list.useQuery();
  const [draft, setDraft] = useState({
    slug: "",
    title: "",
    priceEur: 0,
    oldPriceEur: 0,
    period: "",
    description: "",
    includes: "",
    isPublished: false,
  });

  const create = trpc.admin.offers.create.useMutation({
    onSuccess: () => {
      toast.success("Офертата е създадена");
      refetch();
      setDraft({ slug: "", title: "", priceEur: 0, oldPriceEur: 0, period: "", description: "", includes: "", isPublished: false });
    },
    onError: err => toast.error(err.message),
  });

  const update = trpc.admin.offers.update.useMutation({
    onSuccess: () => {
      toast.success("Обновено");
      refetch();
      utils.content.getOffers.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.offers.delete.useMutation({
    onSuccess: () => refetch(),
    onError: err => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Top оферти</h1>
        <p className="text-[var(--admin-muted)]">Максимум 2 публикувани оферти на сайта</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold">{offer.title}</h3>
                <p className="text-sm text-[var(--admin-muted)]">{offer.period}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={offer.isPublished}
                  onCheckedChange={v => update.mutate({ id: offer.id, isPublished: v })}
                />
                <span className="text-xs">{offer.isPublished ? "Live" : "Off"}</span>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-[var(--admin-accent)]">
              {formatPriceEur(offer.priceEur)}{" "}
              <span className="text-base font-normal line-through text-[var(--admin-muted)]">
                {formatPriceEur(offer.oldPriceEur)}
              </span>
            </p>
            <p className="mt-2 text-sm">{offer.description}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--admin-muted)]">
              {offer.includes.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Button
              variant="destructive"
              size="sm"
              className="mt-4"
              onClick={() => remove.mutate({ id: offer.id })}
            >
              Изтрий
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
        <h3 className="font-serif text-xl font-bold">Нова оферта</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={draft.slug} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} className="admin-input" />
          </div>
          <div className="space-y-2">
            <Label>Заглавие</Label>
            <Input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} className="admin-input" />
          </div>
          <div className="space-y-2">
            <Label>Цена €</Label>
            <Input type="number" value={draft.priceEur} onChange={e => setDraft(d => ({ ...d, priceEur: Number(e.target.value) }))} className="admin-input" />
          </div>
          <div className="space-y-2">
            <Label>Стара цена €</Label>
            <Input type="number" value={draft.oldPriceEur} onChange={e => setDraft(d => ({ ...d, oldPriceEur: Number(e.target.value) }))} className="admin-input" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Период</Label>
            <Input value={draft.period} onChange={e => setDraft(d => ({ ...d, period: e.target.value }))} className="admin-input" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Описание</Label>
            <Textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} className="admin-input" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Включва (по един на ред)</Label>
            <Textarea value={draft.includes} onChange={e => setDraft(d => ({ ...d, includes: e.target.value }))} className="admin-input min-h-[100px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Switch checked={draft.isPublished} onCheckedChange={v => setDraft(d => ({ ...d, isPublished: v }))} />
          <Label>Публикувай веднага</Label>
        </div>
        <Button
          className="admin-btn-primary mt-4"
          onClick={() =>
            create.mutate({
              ...draft,
              includes: draft.includes.split("\n").map(s => s.trim()).filter(Boolean),
            })
          }
        >
          Създай оферта
        </Button>
      </div>
    </div>
  );
}
