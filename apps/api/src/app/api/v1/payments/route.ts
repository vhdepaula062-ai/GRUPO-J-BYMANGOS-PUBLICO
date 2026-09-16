import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const { data: subscriptions, error: subError } = await auth.db.from("subscriptions").select("id").eq("customer_id", customerId);
  if (subError) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Pagamentos indisponíveis", status: 503, detail: subError.message });
  const ids = (subscriptions ?? []).map((item: any) => item.id);
  if (!ids.length) return createSuccessResponse([]);
  const { data, error } = await auth.db.from("payments").select("id, amount_cents, currency, status, payment_method_type, paid_at, created_at, invoice:invoices(invoice_number, due_date, pdf_url)").in("subscription_id", ids).order("created_at", { ascending: false });
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Pagamentos indisponíveis", status: 503, detail: error.message });
  return createSuccessResponse(data ?? []);
}
