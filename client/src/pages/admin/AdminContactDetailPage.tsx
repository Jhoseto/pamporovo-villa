import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ContactVipBadge, GuestNameWithVip } from "@/components/admin/ContactVipBadge";
import { trpc } from "@/lib/trpc";
import { VILLAS } from "@/data/siteContent";
import { bookingStatusLabel, type BookingStatusKey } from "@/lib/adminLabels";
import { whatsAppUrl, formatBookingSummary } from "@/lib/adminBooking";
import { toast } from "sonner";

export default function AdminContactDetailPage() {
  const [, params] = useRoute("/admin/contacts/:id");
  const id = Number(params?.id);
  const utils = trpc.useUtils();

  const { data, isLoading, isError } = trpc.admin.contacts.getById.useQuery(
    { id },
    { enabled: Number.isFinite(id) && id > 0 }
  );

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    if (!data?.contact) return;
    setFullName(data.contact.fullName);
    setPhone(data.contact.phone ?? "");
    setEmail(data.contact.email ?? "");
    setNotes(data.contact.notes ?? "");
    setIsVip(data.contact.isVip);
  }, [data?.contact]);

  const update = trpc.admin.contacts.update.useMutation({
    onSuccess: () => {
      toast.success("Контактът е обновен");
      utils.admin.contacts.getById.invalidate({ id });
      utils.admin.contacts.list.invalidate();
      utils.admin.bookings.list.invalidate();
      utils.admin.bookings.calendar.invalidate();
      utils.admin.bookings.overview.invalidate();
      setEditing(false);
    },
    onError: err => toast.error(err.message),
  });

  const remove = trpc.admin.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Контактът е изтрит");
      utils.admin.contacts.list.invalidate();
      window.location.href = "/admin/contacts";
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="admin-skeleton mx-auto h-64 max-w-4xl rounded-2xl" />;
  }

  if (isError || !data) {
    return (
      <div className="admin-glass-card mx-auto max-w-lg p-6 text-center">
        <p className="text-[var(--admin-muted)]">Контактът не е намерен.</p>
        <Link href="/admin/contacts" className="mt-4 inline-block text-sm underline">
          Към контактите
        </Link>
      </div>
    );
  }

  const { contact, stats, bookings } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/admin/contacts"
        className="inline-flex items-center gap-2 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
      >
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <GuestNameWithVip
            name={contact.fullName}
            isVip={contact.isVip}
            className="font-serif text-3xl font-bold"
          />
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            {stats.total} резервации · {stats.completed} гостували · {stats.rejected} отказани
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing && (
            <Button variant="outline" className="admin-glass-btn" onClick={() => setEditing(true)}>
              Редакция
            </Button>
          )}
          <Button
            variant="outline"
            className="admin-glass-btn text-red-400"
            onClick={() => {
              if (window.confirm("Изтриване на контакта? Резервациите остават.")) {
                remove.mutate({ id });
              }
            }}
            disabled={remove.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Изтрий
          </Button>
        </div>
      </div>

      <div className="admin-glass-card p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Име</Label>
              <Input id="edit-name" value={fullName} onChange={e => setFullName(e.target.value)} className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Телефон</Label>
              <PhoneInput id="edit-phone" value={phone} onChange={e => setPhone(e.target.value)} className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Имейл</Label>
              <Input id="edit-email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Бележки</Label>
              <Textarea id="edit-notes" value={notes} onChange={e => setNotes(e.target.value)} className="admin-input min-h-[100px]" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--admin-glass-border-subtle)] px-4 py-3">
              <div>
                <Label htmlFor="edit-vip" className="text-sm font-medium">
                  VIP клиент
                </Label>
                <p className="text-xs text-[var(--admin-muted)]">Badge се показва в админ панела при резервации</p>
              </div>
              <Switch id="edit-vip" checked={isVip} onCheckedChange={setIsVip} />
            </div>
            <div className="flex gap-2">
              <Button
                className="admin-btn-primary"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({
                    id,
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    notes: notes.trim(),
                    isVip,
                  })
                }
              >
                Запази
              </Button>
              <Button variant="outline" className="admin-glass-btn" onClick={() => setEditing(false)}>
                Отказ
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-[var(--admin-glass-border-subtle)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">VIP клиент</span>
                {contact.isVip ? <ContactVipBadge /> : null}
              </div>
              <Switch
                checked={contact.isVip}
                disabled={update.isPending}
                onCheckedChange={checked =>
                  update.mutate({
                    id,
                    isVip: checked,
                  })
                }
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Телефон</p>
                {contact.phone ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4 opacity-60" />
                      {contact.phone}
                    </a>
                    <a
                      href={whatsAppUrl(
                        contact.phone,
                        formatBookingSummary({
                          id: 0,
                          villaId: "",
                          checkInDate: "",
                          checkOutDate: "",
                          numberOfGuests: 0,
                          guestName: contact.fullName,
                          status: "pending",
                        })
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--admin-muted)] underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                ) : (
                  <p className="mt-1">—</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Имейл</p>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="mt-1 inline-flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4 opacity-60" />
                    {contact.email}
                  </a>
                ) : (
                  <p className="mt-1">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Бележки</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{contact.notes?.trim() || "—"}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-xl font-semibold">История на резервациите</h2>
        <div className="admin-glass-card admin-glass-card--static overflow-hidden">
          {bookings.length === 0 ? (
            <p className="p-8 text-center text-[var(--admin-muted)]">Няма свързани резервации</p>
          ) : (
            <div className="divide-y divide-[var(--admin-glass-border-subtle)]">
              {bookings.map(b => {
                const villa = VILLAS.find(v => v.id === b.villaId)?.name ?? b.villaId;
                return (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}`}
                    className="admin-list-row flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        #{b.id} · {villa}
                      </p>
                      <p className="text-sm text-[var(--admin-muted)]">
                        {b.checkInDate} → {b.checkOutDate} · {b.numberOfGuests} гости
                      </p>
                    </div>
                    <span className={`admin-status admin-status--${b.status as BookingStatusKey}`}>
                      {bookingStatusLabel(b.status as BookingStatusKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
