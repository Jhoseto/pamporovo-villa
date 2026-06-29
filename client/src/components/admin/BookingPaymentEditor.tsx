import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceEur } from "@/data/siteContent";
import { bookingBalanceDue } from "@shared/bookingPayment";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = {
  bookingId: number;
  totalAmountEur: number | null;
  depositPaidEur: number | null;
  suggestedTotal: number | null;
  onSaved?: () => void;
};

export function BookingPaymentEditor({
  bookingId,
  totalAmountEur,
  depositPaidEur,
  suggestedTotal,
  onSaved,
}: Props) {
  const [total, setTotal] = useState("");
  const [deposit, setDeposit] = useState("");
  const [editing, setEditing] = useState(totalAmountEur == null);

  useEffect(() => {
    setTotal(totalAmountEur != null ? String(totalAmountEur) : suggestedTotal != null ? String(suggestedTotal) : "");
    setDeposit(depositPaidEur != null ? String(depositPaidEur) : "0");
    setEditing(totalAmountEur == null);
  }, [totalAmountEur, depositPaidEur, suggestedTotal]);

  const updatePayment = trpc.admin.bookings.updatePayment.useMutation({
    onSuccess: () => {
      toast.success("Плащането е запазено");
      setEditing(false);
      onSaved?.();
    },
    onError: err => toast.error(err.message),
  });

  const totalNum = Number(total);
  const depositNum = Number(deposit);
  const balance =
    Number.isFinite(totalNum) && Number.isFinite(depositNum)
      ? bookingBalanceDue(totalNum, depositNum)
      : null;

  if (!editing && totalAmountEur != null) {
    return (
      <div className="admin-glass-card space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold">Плащане</h2>
            <p className="text-sm text-[var(--admin-muted)]">Капаро и остатък за престоя</p>
          </div>
          <Button variant="outline" size="sm" className="admin-glass-btn" onClick={() => setEditing(true)}>
            Редактирай
          </Button>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--admin-muted)]">Обща сума</dt>
            <dd className="font-serif text-lg font-bold">{formatPriceEur(totalAmountEur)}</dd>
          </div>
          <div>
            <dt className="text-[var(--admin-muted)]">Платено капаро</dt>
            <dd className="font-serif text-lg font-bold">{formatPriceEur(depositPaidEur ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-[var(--admin-muted)]">Остава</dt>
            <dd className="font-serif text-lg font-bold text-[#c9a24d]">
              {formatPriceEur(bookingBalanceDue(totalAmountEur, depositPaidEur) ?? 0)}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="admin-glass-card space-y-4 p-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">Плащане</h2>
        <p className="text-sm text-[var(--admin-muted)]">Обща сума, капаро и остатък</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pay-total">Обща сума (€)</Label>
          <Input id="pay-total" type="number" min={0} value={total} onChange={e => setTotal(e.target.value)} className="admin-input" />
          {suggestedTotal != null && (
            <p className="text-xs text-[var(--admin-muted)]">Изчислена: {formatPriceEur(suggestedTotal)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-deposit">Капаро (€)</Label>
          <Input id="pay-deposit" type="number" min={0} value={deposit} onChange={e => setDeposit(e.target.value)} className="admin-input" />
        </div>
      </div>
      {balance != null && (
        <p className="text-sm">
          Остава за плащане: <strong className="text-[#c9a24d]">{formatPriceEur(balance)}</strong>
        </p>
      )}
      <div className="flex gap-2">
        <Button
          className="admin-btn-primary"
          disabled={updatePayment.isPending}
          onClick={() => {
            if (!Number.isFinite(totalNum) || totalNum < 0 || !Number.isFinite(depositNum) || depositNum < 0) {
              toast.error("Въведете валидни суми");
              return;
            }
            if (depositNum > totalNum) {
              toast.error("Капарото не може да надвишава общата сума");
              return;
            }
            updatePayment.mutate({
              id: bookingId,
              totalAmountEur: totalNum,
              depositPaidEur: depositNum,
            });
          }}
        >
          Запази плащането
        </Button>
        {totalAmountEur != null && (
          <Button variant="outline" className="admin-glass-btn" onClick={() => setEditing(false)}>
            Отказ
          </Button>
        )}
      </div>
    </div>
  );
}
