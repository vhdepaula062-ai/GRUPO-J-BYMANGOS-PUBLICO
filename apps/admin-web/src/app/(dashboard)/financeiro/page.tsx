import React from "react";
import { getFinancialSnapshot } from "@/lib/financial-data";
import { FinanceiroClient } from "./FinanceiroClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function FinanceiroAdminPage() {
  try {
    const snapshot = await getFinancialSnapshot();
    return <>
      <p className="text-sm text-slate-500 mb-3">Consulta concluída: {new Date(snapshot.checkedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Brasília)</p>
      <FinanceiroClient transactions={snapshot.transactions} totalRecebidoCents={snapshot.paidCents} totalPendenteCents={snapshot.pendingCents} totalEstornadoCents={snapshot.reversedCents} />
    </>;
  } catch {
    return <div role="alert" className="p-6 rounded-xl bg-amber-50 text-amber-900">Financeiro indisponível. Não foi possível confirmar os valores no banco. Nenhum total será apresentado até uma consulta bem-sucedida.</div>;
  }
}
