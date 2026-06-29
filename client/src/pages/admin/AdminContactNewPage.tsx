import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminContactNewPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isVip, setIsVip] = useState(false);

  const create = trpc.admin.contacts.create.useMutation({
    onSuccess: res => {
      toast.success("Контактът е добавен");
      utils.admin.contacts.list.invalidate();
      setLocation(`/admin/contacts/${res.id}`);
    },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/contacts"
        className="inline-flex text-sm text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
      >
        ← Към контактите
      </Link>
      <div className="admin-page-header">
        <h1 className="font-serif text-3xl font-semibold">Нов контакт</h1>
        <p className="text-[var(--admin-muted)]">Визитка на клиент</p>
      </div>
      <div className="admin-glass-card space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Име</Label>
          <Input
            id="contact-name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Телефон</Label>
          <PhoneInput
            id="contact-phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="admin-input"
            placeholder="0881234567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Имейл</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="admin-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-notes">Бележки</Label>
          <Textarea
            id="contact-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="admin-input min-h-[100px]"
            placeholder="Предпочитания, бележки от разговори…"
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[var(--admin-glass-border-subtle)] px-4 py-3">
          <div>
            <Label htmlFor="contact-vip" className="text-sm font-medium">
              VIP клиент
            </Label>
            <p className="text-xs text-[var(--admin-muted)]">Badge се показва в админ панела при резервации</p>
          </div>
          <Switch id="contact-vip" checked={isVip} onCheckedChange={setIsVip} />
        </div>
        <Button
          className="admin-btn-primary"
          disabled={create.isPending}
          onClick={() => {
            if (!fullName.trim()) {
              toast.error("Въведете име");
              return;
            }
            if (!phone.trim() && !email.trim()) {
              toast.error("Въведете телефон или имейл");
              return;
            }
            create.mutate({
              fullName: fullName.trim(),
              phone: phone.trim() || undefined,
              email: email.trim() || undefined,
              notes: notes.trim() || undefined,
              isVip,
            });
          }}
        >
          Запази
        </Button>
      </div>
    </div>
  );
}
