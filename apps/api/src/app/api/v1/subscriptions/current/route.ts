import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const { data, error } = await auth.db.from("subscriptions").select("id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, trial_end, plan:plans(id, code, name, price_cents, currency, billing_interval_months)").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Assinatura indisponível", status: 503, detail: error.message });
  if (!data) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/subscription-not-found", title: "Assinatura não encontrada", status: 404, detail: "Conclua a contratação do plano para acessar os benefícios." });
  return createSuccessResponse(data);
}
