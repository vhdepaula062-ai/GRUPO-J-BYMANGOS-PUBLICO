import { NextRequest } from "next/server";
import { authenticateRequest, getAdminDatabase, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const body = await request.json();
  if (!body.benefitDefinitionId || !body.workshopId) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Dados incompletos", status: 422, detail: "Benefício e oficina são obrigatórios." });
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const admin = getAdminDatabase();
  const [{ data: customer }, { data: subscription }, { data: entitlement }] = await Promise.all([
    admin.from("customers").select("assigned_workshop_id").eq("id", customerId).single(),
    admin.from("subscriptions").select("status, current_period_end").eq("customer_id", customerId).eq("status", "active").gt("current_period_end", new Date().toISOString()).maybeSingle(),
    admin.from("entitlements").select("available_quantity, benefit:benefit_definitions(name, grace_period_days)").eq("customer_id", customerId).eq("benefit_definition_id", body.benefitDefinitionId).gt("available_quantity", 0).maybeSingle()
  ]);
  if (customer?.assigned_workshop_id !== body.workshopId) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/workshop-mismatch", title: "Oficina não vinculada", status: 403, detail: "O benefício só pode ser usado na oficina vinculada." });
  if (!subscription) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/subscription-inactive", title: "Assinatura inativa", status: 403, detail: "Regularize a assinatura para usar benefícios." });
  if (!entitlement) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/no-balance", title: "Benefício indisponível", status: 422, detail: "Não há saldo deste benefício no ciclo atual." });
  return createSuccessResponse({ eligible: true, availableQuantity: entitlement.available_quantity, benefit: entitlement.benefit });
}
