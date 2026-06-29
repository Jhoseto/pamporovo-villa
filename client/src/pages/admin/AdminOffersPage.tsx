import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatPriceEur } from "@/data/siteContent";

type OfferDraft = {
  slug: string;
  title: string;
  priceEur: number;
  oldPriceEur: number;
  period: string;
  description: string;
  includes: string;
  isPublished: boolean;
};

const emptyDraft = (): OfferDraft => ({
  slug: "",
  title: "",
  priceEur: 0,
  oldPriceEur: 0,
  period: "",
  description: "",
  includes: "",
  isPublished: false,
});

function offerToDraft(offer: {
  slug: string;
  title: string;
  priceEur: number;
  oldPriceEur: number;
  period: string;
  description: string;
  includes: string[];
  isPublished: boolean;
}): OfferDraft {
  return {
    slug: offer.slug,
    title: offer.title,
    priceEur: offer.priceEur,
    oldPriceEur: offer.oldPriceEur,
    period: offer.period,
    description: offer.description,
    includes: offer.includes.join("\n"),
    isPublished: offer.isPublished,
  };
}

function OfferFormFields({
  draft,
  setDraft,
  idPrefix,
}: {
  draft: OfferDraft;
  setDraft: React.Dispatch<React.SetStateAction<OfferDraft>>;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-slug`}>URL идентификатор</Label>
        <Input
          id={`${idPrefix}-slug`}
          value={draft.slug}
          onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>Заглавие</Label>
        <Input
          id={`${idPrefix}-title`}
          value={draft.title}
          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-price`}>Цена €</Label>
        <Input
          id={`${idPrefix}-price`}
          type="number"
          value={draft.priceEur}
          onChange={e => setDraft(d => ({ ...d, priceEur: Number(e.target.value) }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-old-price`}>Стара цена €</Label>
        <Input
          id={`${idPrefix}-old-price`}
          type="number"
          value={draft.oldPriceEur}
          onChange={e => setDraft(d => ({ ...d, oldPriceEur: Number(e.target.value) }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-period`}>Период</Label>
        <Input
          id={`${idPrefix}-period`}
          value={draft.period}
          onChange={e => setDraft(d => ({ ...d, period: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-description`}>Описание</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={draft.description}
          onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-includes`}>Включва (по един на ред)</Label>
        <Textarea
          id={`${idPrefix}-includes`}
          value={draft.includes}
          onChange={e => setDraft(d => ({ ...d, includes: e.target.value }))}
          className="admin-input min-h-[100px]"
        />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Switch
          checked={draft.isPublished}
          onCheckedChange={v => setDraft(d => ({ ...d, isPublished: v }))}
        />
        <Label>Публикувана на сайта</Label>
      </div>
    </div>
  );
}

export default function AdminOffersPage() {
  const utils = trpc.useUtils();
  const { data: offers = [], isLoading } = trpc.admin.offers.list.useQuery();
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<OfferDraft>(emptyDraft());

  const invalidateOffers = () => {
    utils.admin.offers.list.invalidate();
    utils.content.getOffers.invalidate();
  };

  const create = trpc.admin.offers.create.useMutation({
    onSuccess: () => {
      toast.success("Офертата е създадена");
      invalidateOffers();
      setDraft(emptyDraft());
    },
    onError: err => toast.error(err.message),
  });

  const update = trpc.admin.offers.update.useMutation({
    onSuccess: () => {
      toast.success("Офертата е обновена");
      invalidateOffers();
      setEditingId(null);
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.offers.delete.useMutation({
    onSuccess: () => {
      toast.success("Офертата е изтрита");
      invalidateOffers();
      if (editingId != null) setEditingId(null);
    },
    onError: err => toast.error(err.message),
  });

  const startEdit = (offer: (typeof offers)[number]) => {
    setEditingId(offer.id);
    setEditDraft(offerToDraft(offer));
  };

  const saveEdit = () => {
    if (editingId == null) return;
    update.mutate({
      id: editingId,
      ...editDraft,
      includes: editDraft.includes
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1>Топ оферти</h1>
        <p>Максимум 2 публикувани оферти на сайта</p>
      </div>

      {isLoading ? (
        <div className="admin-skeleton h-48 rounded-2xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {offers.map(offer =>
            editingId === offer.id ? (
              <div key={offer.id} className="admin-glass-card p-5">
                <h3 className="font-serif text-xl font-semibold">Редакция</h3>
                <div className="mt-4">
                  <OfferFormFields draft={editDraft} setDraft={setEditDraft} idPrefix={`edit-${offer.id}`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="admin-btn-primary" onClick={saveEdit} disabled={update.isPending}>
                    Запази
                  </Button>
                  <Button variant="outline" className="admin-glass-btn" onClick={() => setEditingId(null)}>
                    Отказ
                  </Button>
                </div>
              </div>
            ) : (
              <div key={offer.id} className="admin-glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold">{offer.title}</h3>
                    <p className="text-sm text-[var(--admin-muted)]">{offer.period}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={offer.isPublished}
                      onCheckedChange={v => update.mutate({ id: offer.id, isPublished: v })}
                      disabled={update.isPending}
                    />
                    <span className="text-xs">{offer.isPublished ? "Публикувана" : "Скрита"}</span>
                  </div>
                </div>
                <p className="admin-offer-price mt-3">
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="admin-glass-btn" onClick={() => startEdit(offer)}>
                    Редактирай
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (!window.confirm(`Изтриване на „${offer.title}"?`)) return;
                      remove.mutate({ id: offer.id });
                    }}
                    disabled={remove.isPending}
                  >
                    Изтрий
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="admin-glass-card p-6">
        <h3 className="font-serif text-xl font-semibold">Нова оферта</h3>
        <div className="mt-4">
          <OfferFormFields draft={draft} setDraft={setDraft} idPrefix="new" />
        </div>
        <Button
          className="admin-btn-primary mt-4"
          onClick={() =>
            create.mutate({
              ...draft,
              includes: draft.includes
                .split("\n")
                .map(s => s.trim())
                .filter(Boolean),
            })
          }
          disabled={create.isPending}
        >
          Създай оферта
        </Button>
      </div>
    </div>
  );
}
