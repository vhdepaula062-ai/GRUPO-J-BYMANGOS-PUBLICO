import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const { data, error } = await auth.db.from("entitlements").select("id, total_quantity, used_quantity, available_quantity, benefit:benefit_definitions(id, name, slug, description, periodicity, grace_period_days), cycle:entitlement_cycles(cycle_start, cycle_end)").eq("customer_id", customerId);
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Benefícios indisponíveis", status: 503, detail: error.message });

  if (data && data.length > 0) {
    return createSuccessResponse(data);
  }

  // Se o cliente ainda não ativou a assinatura ou não gerou o ciclo de entitlements,
  // exibe o catálogo completo dos benefícios do plano preventivo Grupo J
  const { data: catalog, error: catalogError } = await auth.db
    .from("benefit_definitions")
    .select("id, name, slug, description, periodicity, quantity_per_cycle")
    .eq("is_included_in_base_plan", true)
    .eq("is_active", true)
    .order("name");

  if (catalogError) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Benefícios indisponíveis", status: 503, detail: catalogError.message });

  const fallbackEntitlements = (catalog ?? []).map(b => ({
    id: `cat-${b.id}`,
    total_quantity: b.quantity_per_cycle ?? 1,
    used_quantity: 0,
    available_quantity: b.quantity_per_cycle ?? 1,
    benefit: {
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      periodicity: b.periodicity,
      grace_period_days: 0
    },
    cycle: null
  }));

  return createSuccessResponse(fallbackEntitlements);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const body = await request.json();
  if (!body.vehicleId || !body.benefitDefinitionId) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Dados do voucher incompletos", status: 422, detail: "Selecione o veículo e o benefício." });
  const { data, error } = await auth.db.rpc("create_benefit_voucher", { p_vehicle_id: body.vehicleId, p_benefit_definition_id: body.benefitDefinitionId });
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/voucher-create-failed", title: "Voucher não gerado", status: 422, detail: error.message });
  return createSuccessResponse(data, 201);
}
