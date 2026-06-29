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
import { formatPriceEur } from "@/data/siteContent";
import { bookingBalanceDue } from "@shared/bookingPayment";
import { BookingConfirmationCardPreview } from "@/components/admin/BookingConfirmationCardPreview";
import type { ConfirmationCardData } from "@/lib/confirmationCardImage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  guestName: string;
  villaId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  nights: number;
  suggestedTotal: number | null;
  busy?: boolean;
  onConfirm: (payment: { totalAmountEur: number; depositPaidEur: number }) => void;
};

export function BookingConfirmDialog({
  open,
  onOpenChange,
  bookingId,
  guestName,
  villaId,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  nights,
  suggestedTotal,
  busy,
  onConfirm,
}: Props) {
  const [total, setTotal] = useState("");
  const [deposit, setDeposit] = useState("");

  useEffect(() => {
    if (!open) return;
    setTotal(suggestedTotal != null ? String(suggestedTotal) : "");
    setDeposit("");
  }, [open, suggestedTotal]);

  const totalNum = Number(total);
  const depositNum = Number(deposit);
  const validTotal = Number.isFinite(totalNum) && totalNum >= 0;
  const validDeposit = Number.isFinite(depositNum) && depositNum >= 0;
  const balance = validTotal ? bookingBalanceDue(totalNum, validDeposit ? depositNum : 0) : null;

  const preview: ConfirmationCardData | null =
    validTotal && validDeposit
      ? {
          bookingId,
          guestName,
          villaId,
          checkInDate,
          checkOutDate,
          nights,
          numberOfGuests,
          totalAmountEur: totalNum,
          depositPaidEur: depositNum,
        }
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-glass-card max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Потвърждение на резервация</DialogTitle>
          <DialogDescription>
            Въведете общата сума и платеното капаро. Клиентът ще получи карта с детайлите.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-total">Обща сума (€)</Label>
              <Input
                id="confirm-total"
                type="number"
                min={0}
                step={1}
                value={total}
                onChange={e => setTotal(e.target.value)}
                className="admin-input"
                placeholder={suggestedTotal != null ? String(suggestedTotal) : "0"}
              />
              {suggestedTotal != null && (
                <p className="text-xs text-[var(--admin-muted)]">
                  Изчислена цена: {formatPriceEur(suggestedTotal)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-deposit">Платено капаро (€)</Label>
              <Input
                id="confirm-deposit"
                type="number"
                min={0}
                step={1}
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                className="admin-input"
                placeholder="0"
              />
            </div>
            {balance != null && (
              <div className="admin-glass-card rounded-xl p-4">
                <p className="text-sm text-[var(--admin-muted)]">Остава за плащане</p>
                <p className="font-serif text-2xl font-bold text-[#c9a24d]">{formatPriceEur(balance)}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-[var(--admin-muted)]">Преглед на картата</p>
            {preview ? (
              <BookingConfirmationCardPreview data={preview} />
            ) : (
              <div className="flex h-64 w-[320px] items-center justify-center rounded-2xl border border-dashed border-[var(--admin-glass-border-subtle)] text-sm text-[var(--admin-muted)]">
                Попълнете сумите
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="admin-glass-btn" onClick={() => onOpenChange(false)} disabled={busy}>
            Отказ
          </Button>
          <Button
            className="admin-btn-primary"
            disabled={busy || !validTotal || !validDeposit || depositNum > totalNum}
            onClick={() => onConfirm({ totalAmountEur: totalNum, depositPaidEur: depositNum })}
          >
            Потвърди резервацията
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
