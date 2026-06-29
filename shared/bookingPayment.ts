export function bookingBalanceDue(
  totalAmountEur: number | null | undefined,
  depositPaidEur: number | null | undefined
): number | null {
  if (totalAmountEur == null) return null;
  return Math.max(0, totalAmountEur - (depositPaidEur ?? 0));
}

export function formatAmountEur(amount: number): string {
  return `${amount.toLocaleString("bg-BG")} €`;
}
