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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestEmail: string;
  guestName: string;
  fromEmail?: string;
  busy?: boolean;
  onSend: (personalMessage: string | undefined) => void;
};

export function BookingSendCardEmailDialog({
  open,
  onOpenChange,
  guestEmail,
  guestName,
  fromEmail,
  busy,
  onSend,
}: Props) {
  const [personalMessage, setPersonalMessage] = useState("");

  useEffect(() => {
    if (!open) setPersonalMessage("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-glass-card border-[var(--admin-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Изпрати карта по имейл</DialogTitle>
          <DialogDescription>
            До <strong>{guestEmail}</strong>
            {guestName ? ` (${guestName})` : null} — JPG картата се прикача към имейла
            {fromEmail ? (
              <>
                {" "}
                · от <strong>{fromEmail}</strong>
              </>
            ) : null}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="card-email-message">Допълнителен текст (по избор)</Label>
          <Textarea
            id="card-email-message"
            value={personalMessage}
            onChange={e => setPersonalMessage(e.target.value)}
            placeholder="Лично съобщение към клиента преди текста за резервацията…"
            rows={5}
            maxLength={4000}
            className="min-h-[120px] resize-y"
          />
          <p className="text-xs text-[var(--admin-muted)]">
            Показва се в тялото на имейла; картата остава прикачен JPG файл.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="admin-glass-btn" onClick={() => onOpenChange(false)} disabled={busy}>
            Отказ
          </Button>
          <Button
            className="admin-btn-primary"
            disabled={busy}
            onClick={() => onSend(personalMessage.trim() || undefined)}
          >
            {busy ? "Изпращане…" : "Изпрати"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
