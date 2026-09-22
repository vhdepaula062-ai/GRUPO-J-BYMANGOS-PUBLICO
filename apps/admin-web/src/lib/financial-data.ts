import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { checkIsAdmin } from "@/lib/supabase/server";
import { summarizePayments } from "@grupo-j/domain";

// Keyset pagination avoids the REST row cap and offset shifts caused by new rows.
export async function readFinancialRows(table: "payments" | "subscriptions" | "plans", select: string) {
  if (!(await checkIsAdmin())) throw new Error("Acesso financeiro não autorizado");
  const db = await createAuthorizedAdminClient();
  const rows: any[] = [];
  let cursor: string | undefined;
  for (;;) {
    let query = db.from(table).select(select).order("id").limit(500);
    if (cursor) query = query.gt("id", cursor);
    const { data, error } = await query;
    if (error || !data) throw new Error("Não foi possível consultar os registros financeiros");
    rows.push(...data);
    if (!data.length) return rows;
    cursor = (data[data.length - 1] as any).id;
  }
}

export async function getFinancialSnapshot() {
  const payments = await readFinancialRows("payments", "id, created_at, paid_at, amount_cents, currency, status, gateway_payment_id, payment_method_type, subscription:subscriptions(customer_id, organization_id)");
  return {
    ...summarizePayments(payments),
    checkedAt: new Date().toISOString(),
    transactions: payments.map(p => ({
      id: p.id, created_at: p.paid_at ?? p.created_at, amount_cents: p.amount_cents,
      type: p.payment_method_type, status: p.status,
      description: p.subscription?.organization_id ? "Mensalidade de oficina" : "Assinatura de motorista",
      reference_id: p.gateway_payment_id ?? p.id
    })).sort((a, b) => b.created_at.localeCompare(a.created_at))
  };
}
