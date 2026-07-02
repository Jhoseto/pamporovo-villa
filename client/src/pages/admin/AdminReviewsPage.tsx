import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REVIEW_BODY_MAX } from "@shared/reviewLimits";
import { VILLAS } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ReviewDraft = {
  guestName: string;
  guestEmail: string;
  rating: number;
  body: string;
  villaId: string;
  stayPeriod: string;
  isPublished: boolean;
};

const emptyDraft = (): ReviewDraft => ({
  guestName: "",
  guestEmail: "",
  rating: 5,
  body: "",
  villaId: "",
  stayPeriod: "",
  isPublished: false,
});

function reviewToDraft(review: {
  guestName: string;
  guestEmail: string | null;
  rating: number;
  body: string;
  villaId: string | null;
  stayPeriod: string | null;
  isPublished: boolean;
}): ReviewDraft {
  return {
    guestName: review.guestName,
    guestEmail: review.guestEmail ?? "",
    rating: review.rating,
    body: review.body,
    villaId: review.villaId ?? "",
    stayPeriod: review.stayPeriod ?? "",
    isPublished: review.isPublished,
  };
}

function StarPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: number;
  onChange: (rating: number) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          id={star === value ? `${idPrefix}-rating` : undefined}
          aria-label={`${star} звезди`}
          className="rounded p-0.5 transition hover:scale-110"
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "h-6 w-6",
              star <= value ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[var(--admin-muted)]"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewFormFields({
  draft,
  setDraft,
  idPrefix,
}: {
  draft: ReviewDraft;
  setDraft: React.Dispatch<React.SetStateAction<ReviewDraft>>;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Име на гост</Label>
        <Input
          id={`${idPrefix}-name`}
          value={draft.guestName}
          onChange={e => setDraft(d => ({ ...d, guestName: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Имейл (по избор)</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={draft.guestEmail}
          onChange={e => setDraft(d => ({ ...d, guestEmail: e.target.value }))}
          className="admin-input"
        />
      </div>
      <div className="space-y-2">
        <Label>Оценка</Label>
        <StarPicker
          value={draft.rating}
          onChange={rating => setDraft(d => ({ ...d, rating }))}
          idPrefix={idPrefix}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-period`}>Период на престой (по избор)</Label>
        <Input
          id={`${idPrefix}-period`}
          value={draft.stayPeriod}
          onChange={e => setDraft(d => ({ ...d, stayPeriod: e.target.value }))}
          placeholder="напр. Януари 2025"
          className="admin-input"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-villa`}>Вила (по избор)</Label>
        <Select
          value={draft.villaId || "none"}
          onValueChange={v => setDraft(d => ({ ...d, villaId: v === "none" ? "" : v }))}
        >
          <SelectTrigger id={`${idPrefix}-villa`} className="admin-input">
            <SelectValue placeholder="Без конкретна вила" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без конкретна вила</SelectItem>
            {VILLAS.map(villa => (
              <SelectItem key={villa.id} value={villa.id}>
                {villa.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-body`}>Отзив</Label>
        <Textarea
          id={`${idPrefix}-body`}
          value={draft.body}
          onChange={e => setDraft(d => ({ ...d, body: e.target.value.slice(0, REVIEW_BODY_MAX) }))}
          className="admin-input min-h-[120px]"
          maxLength={REVIEW_BODY_MAX}
        />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Switch
          checked={draft.isPublished}
          onCheckedChange={v => setDraft(d => ({ ...d, isPublished: v }))}
        />
        <Label>Публикуван на сайта</Label>
      </div>
    </div>
  );
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function villaLabel(villaId: string | null) {
  if (!villaId) return null;
  return VILLAS.find(v => v.id === villaId)?.name ?? villaId;
}

export default function AdminReviewsPage() {
  const utils = trpc.useUtils();
  const { data: reviews = [], isLoading } = trpc.admin.reviews.list.useQuery();
  const { data: pendingCount = 0 } = trpc.admin.reviews.pendingCount.useQuery();
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ReviewDraft>(emptyDraft());

  const invalidateReviews = () => {
    utils.admin.reviews.list.invalidate();
    utils.admin.reviews.pendingCount.invalidate();
    utils.content.getReviews.invalidate();
  };

  const create = trpc.admin.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Отзивът е добавен");
      invalidateReviews();
      setDraft(emptyDraft());
    },
    onError: err => toast.error(err.message),
  });

  const update = trpc.admin.reviews.update.useMutation({
    onSuccess: () => {
      toast.success("Отзивът е обновен");
      invalidateReviews();
      setEditingId(null);
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Отзивът е изтрит");
      invalidateReviews();
      if (editingId != null) setEditingId(null);
    },
    onError: err => toast.error(err.message),
  });

  const startEdit = (review: (typeof reviews)[number]) => {
    setEditingId(review.id);
    setEditDraft(reviewToDraft(review));
  };

  const saveEdit = () => {
    if (editingId == null) return;
    update.mutate({
      id: editingId,
      guestName: editDraft.guestName,
      guestEmail: editDraft.guestEmail,
      rating: editDraft.rating,
      body: editDraft.body,
      villaId: editDraft.villaId
        ? (editDraft.villaId as "villa-1" | "villa-2" | "villa-deluxe")
        : null,
      stayPeriod: editDraft.stayPeriod || null,
      isPublished: editDraft.isPublished,
    });
  };

  const submitCreate = () => {
    create.mutate({
      guestName: draft.guestName,
      guestEmail: draft.guestEmail,
      rating: draft.rating,
      body: draft.body,
      villaId: draft.villaId ? (draft.villaId as "villa-1" | "villa-2" | "villa-deluxe") : undefined,
      stayPeriod: draft.stayPeriod,
      isPublished: draft.isPublished,
    });
  };

  return (
    <div className="space-y-8">
      <div className="admin-page-header">
        <h1>Отзиви от гости</h1>
        <p>
          Преглеждайте отзиви от сайта и публикувайте одобрените на началната страница.
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-200">
              {pendingCount} чакащи
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="admin-skeleton h-48 rounded-2xl" />
      ) : reviews.length === 0 ? (
        <div className="admin-glass-card p-8 text-center text-[var(--admin-muted)]">
          Все още няма отзиви. Гостите могат да оставят такъв от секцията „Отзиви“ на сайта.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {reviews.map(review =>
            editingId === review.id ? (
              <div key={review.id} className="admin-glass-card p-5">
                <h3 className="font-serif text-xl font-semibold">Редакция</h3>
                <div className="mt-4">
                  <ReviewFormFields
                    draft={editDraft}
                    setDraft={setEditDraft}
                    idPrefix={`edit-${review.id}`}
                  />
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
              <div key={review.id} className="admin-glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold">{review.guestName}</h3>
                    <p className="text-sm text-[var(--admin-muted)]">
                      {formatReviewDate(review.createdAt)}
                      {review.stayPeriod ? ` · ${review.stayPeriod}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-[var(--gold)] text-[var(--gold)]"
                              : "text-[var(--admin-muted)]"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={review.isPublished}
                        onCheckedChange={v => update.mutate({ id: review.id, isPublished: v })}
                        disabled={update.isPending}
                      />
                      <span className="text-xs">{review.isPublished ? "Публикуван" : "Чакащ"}</span>
                    </div>
                  </div>
                </div>
                {villaLabel(review.villaId) && (
                  <p className="mt-2 text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                    {villaLabel(review.villaId)}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed">{review.body}</p>
                <p className="mt-2 text-xs text-[var(--admin-muted)]">
                  Източник: {review.source === "website" ? "Сайт" : "Админ"}
                  {review.guestEmail ? ` · ${review.guestEmail}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="admin-glass-btn" onClick={() => startEdit(review)}>
                    Редактирай
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (!window.confirm(`Изтриване на отзива от „${review.guestName}"?`)) return;
                      remove.mutate({ id: review.id });
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
        <h3 className="font-serif text-xl font-semibold">Нов отзив (ръчно)</h3>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Добавете отзив от админ панела — например след телефонен разговор с гост.
        </p>
        <div className="mt-4">
          <ReviewFormFields draft={draft} setDraft={setDraft} idPrefix="new" />
        </div>
        <Button className="admin-btn-primary mt-4" onClick={submitCreate} disabled={create.isPending}>
          Добави отзив
        </Button>
      </div>
    </div>
  );
}
