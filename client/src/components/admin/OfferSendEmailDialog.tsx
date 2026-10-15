import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: number;
  offerTitle: string;
};

export function OfferSendEmailDialog({ open, onOpenChange, offerId, offerTitle }: Props) {
  const [to, setTo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const { data: emailStatus } = trpc.admin.bookings.emailStatus.useQuery(undefined, { enabled: open });

  const send = trpc.admin.offers.sendByEmail.useMutation({
    onSuccess: () => {
      toast.success("Офертата е изпратена по имейл");
      onOpenChange(false);
    },
    onError: err => toast.error(err.message),
  });

  useEffect(() => {
    if (!open) {
      setTo("");
      setGuestName("");
      setPersonalMessage("");
    }
  }, [open]);

  const handleSubmit = () => {
    const email = to.trim();
    if (!email) {
      toast.error("Въведете имейл на получателя");
      return;
    }
    if (!emailStatus?.configured) {
      toast.error("Имейл не е конфигуриран на сървъра (JetHost SMTP)");
      return;
    }
    send.mutate({
      id: offerId,
      to: email,
      guestName: guestName.trim() || undefined,
      personalMessage: personalMessage.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-glass-card border-[var(--admin-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Изпрати оферта по имейл</DialogTitle>
          <DialogDescription>
            „{offerTitle}" — изпраща се от{" "}
            <strong>{emailStatus?.fromEmail ?? "pamporovovilla@gmail.com"}</strong> през JetHost SMTP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="offer-email-to">Имейл на клиента</Label>
            <Input
              id="offer-email-to"
              type="email"
              autoComplete="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="client@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-email-name">Име (по избор)</Label>
            <Input
              id="offer-email-name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Иван"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-email-message">Допълнителен текст (по избор)</Label>
            <Textarea
              id="offer-email-message"
              value={personalMessage}
              onChange={e => setPersonalMessage(e.target.value)}
              placeholder="Кратко съобщение към клиента преди офертата…"
              rows={4}
              maxLength={4000}
              className="min-h-[100px] resize-y"
            />
            <p className="text-xs text-[var(--admin-muted)]">
              Показва се след поздрава, преди детайлите на офертата.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="admin-glass-btn" onClick={() => onOpenChange(false)}>
            Отказ
          </Button>
          <Button className="admin-btn-primary" onClick={handleSubmit} disabled={send.isPending}>
            {send.isPending ? "Изпращане…" : "Изпрати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
