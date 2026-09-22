import { describe, expect, it } from "vitest";
import { summarizePayments } from "./financial-summary";

describe("financial truth", () => {
  it("does not count pending, authorized, failed or reversed payments as received", () => {
    const rows = ["paid", "pending", "authorized", "failed", "refunded", "charged_back"].map((status, i) => ({ id: String(i), status, currency: "BRL", amount_cents: 5000 }));
    expect(summarizePayments(rows)).toEqual({ paidCents: 5000, pendingCents: 10000, reversedCents: 10000 });
  });
  it("empty ledger is zero and more than 50 payments are included", () => {
    expect(summarizePayments([]).paidCents).toBe(0);
    expect(summarizePayments(Array.from({ length: 1201 }, (_, i) => ({ id: String(i), status: "paid", currency: "BRL", amount_cents: 101 })))).toEqual({ paidCents: 121301, pendingCents: 0, reversedCents: 0 });
  });
  it("fails closed on duplicate, unknown, fractional or foreign-currency entries", () => {
    const payment = { id: "1", status: "paid", currency: "BRL", amount_cents: 5000 };
    expect(() => summarizePayments([payment, payment])).toThrow();
    for (const override of [{ currency: "USD" }, { amount_cents: 1.5 }, { amount_cents: -1 }, { status: "completed" }]) {
      expect(() => summarizePayments([{ ...payment, ...override }])).toThrow();
    }
  });
});
