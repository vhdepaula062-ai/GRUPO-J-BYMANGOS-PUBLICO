export interface FinancialPayment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
}

/** Totals of persisted payment states; registrations and vouchers are not money. */
export function summarizePayments(payments: FinancialPayment[]) {
  let paidCents = 0;
  let pendingCents = 0;
  let reversedCents = 0;
  const seen = new Set<string>();
  for (const payment of payments) {
    if (seen.has(payment.id)) throw new Error("Pagamento duplicado na consulta financeira");
    seen.add(payment.id);
    if (payment.currency !== "BRL" || !Number.isSafeInteger(payment.amount_cents) || payment.amount_cents < 0) {
      throw new Error("Valor ou moeda financeira não suportado");
    }
    if (payment.status === "paid") paidCents += payment.amount_cents;
    else if (["pending", "authorized"].includes(payment.status)) pendingCents += payment.amount_cents;
    else if (["refunded", "charged_back"].includes(payment.status)) reversedCents += payment.amount_cents;
    else if (payment.status !== "failed") throw new Error("Status financeiro desconhecido");
  }
  if (![paidCents, pendingCents, reversedCents].every(Number.isSafeInteger)) throw new Error("Total financeiro fora do limite");
  return { paidCents, pendingCents, reversedCents };
}
