import { describe, expect, it } from "vitest";
import { bookingBalanceDue, formatAmountEur } from "@shared/bookingPayment";

describe("bookingBalanceDue", () => {
  it("computes remaining balance", () => {
    expect(bookingBalanceDue(500, 150)).toBe(350);
  });

  it("never returns negative balance", () => {
    expect(bookingBalanceDue(100, 200)).toBe(0);
  });

  it("formats EUR in bg locale style", () => {
    expect(formatAmountEur(1200)).toContain("€");
  });
});
