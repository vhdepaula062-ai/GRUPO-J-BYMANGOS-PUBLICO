import React from "react";
import { getTransactions } from "@/lib/queries";
import { FinanceiroClient } from "./FinanceiroClient";

export const dynamic = "force-dynamic";

export default async function FinanceiroAdminPage() {
  const transactions = await getTransactions();

  // Cálculo de balanço baseado nas transações reais
  const totalRecebidoCents = transactions
    .filter((t) => t.status === "paid" || t.status === "completed" || t.status === "settled")
    .reduce((acc, t) => acc + (t.amount_cents > 0 ? t.amount_cents : 0), 0);

  const totalRepassesCents = transactions
    .filter((t) => t.type === "workshop_reimbursement" || t.amount_cents < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount_cents), 0);

  const saldoLiquidoCents = totalRecebidoCents - totalRepassesCents;

  return (
    <FinanceiroClient
      transactions={transactions}
      totalRecebidoCents={totalRecebidoCents}
      totalRepassesCents={totalRepassesCents}
      saldoLiquidoCents={saldoLiquidoCents}
    />
  );
}
