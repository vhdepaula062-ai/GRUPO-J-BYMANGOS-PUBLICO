import { NextRequest } from "next/server";
import crypto from "crypto";
import { authenticateRequest, getAdminDatabase, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;

  let customerId: string | null = null;
  try {
    customerId = await getCustomerId(auth.db, auth.user.id);
  } catch {
    // Se cliente ainda não existe, cria ou busca no admin
    const admin = getAdminDatabase();
    const { data: c } = await admin
      .from("customers")
      .select("id")
      .eq("profile_id", auth.user.id)
      .maybeSingle();
    customerId = c?.id || null;
  }

  if (customerId) {
    const { data, error } = await auth.db
      .from("entitlements")
      .select(
        "id, total_quantity, used_quantity, available_quantity, benefit:benefit_definitions(id, name, slug, description, periodicity, grace_period_days), cycle:entitlement_cycles(cycle_start, cycle_end)"
      )
      .eq("customer_id", customerId);

    if (!error && data && data.length > 0) {
      return createSuccessResponse(data);
    }
  }

  // Se o cliente ainda não ativou a assinatura ou não gerou o ciclo de entitlements,
  // exibe o catálogo completo dos benefícios do plano preventivo Grupo J
  const admin = getAdminDatabase();
  const { data: catalog, error: catalogError } = await admin
    .from("benefit_definitions")
    .select("id, name, slug, description, periodicity, quantity_per_cycle")
    .eq("is_included_in_base_plan", true)
    .eq("is_active", true)
    .order("name");

  if (catalogError) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/query-failed",
      title: "Benefícios indisponíveis",
      status: 503,
      detail: catalogError.message
    });
  }

  const fallbackEntitlements = (catalog ?? []).map((b) => ({
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
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;

  const body = await request.json().catch(() => ({}));
  if (!body.vehicleId || !body.benefitDefinitionId) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/validation-error",
      title: "Dados do voucher incompletos",
      status: 422,
      detail: "Selecione o veículo e o benefício."
    });
  }

  const admin = getAdminDatabase();

  try {
    // 1. Busca registro de cliente do motorista
    const { data: customer } = await admin
      .from("customers")
      .select("id, assigned_workshop_id")
      .eq("profile_id", auth.user.id)
      .maybeSingle();

    if (!customer) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/customer-not-found",
        title: "Cadastro de cliente não encontrado",
        status: 404,
        detail: "Complete seu cadastro antes de solicitar benefícios."
      });
    }

    // 2. Valida titularidade do veículo: deve pertencer ao cliente autenticado e estar ativo
    const { data: vehicle, error: vehicleErr } = await admin
      .from("vehicles")
      .select("id, customer_id, is_active")
      .eq("id", body.vehicleId)
      .eq("customer_id", customer.id)
      .eq("is_active", true)
      .maybeSingle();

    if (vehicleErr || !vehicle) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/vehicle-not-found",
        title: "Veículo não encontrado",
        status: 403,
        detail: "O veículo informado não pertence ao motorista autenticado ou está inativo."
      });
    }

    // 3. Garante que haja uma oficina vinculada
    const workshopId = customer.assigned_workshop_id;
    if (!workshopId) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/workshop-required",
        title: "Oficina credenciada necessária",
        status: 422,
        detail: "Vincule uma oficina credenciada ao seu perfil antes de solicitar o benefício."
      });
    }

    const nowIso = new Date().toISOString();

    // 4. Verificação da regra dos 30 dias de carência (grace_period_days)
    const [{ data: sub }, { data: benefitDef }] = await Promise.all([
      admin
        .from("subscriptions")
        .select("status, created_at, started_at, current_period_end")
        .eq("customer_id", customer.id)
        .eq("status", "active")
        .gt("current_period_end", nowIso)
        .maybeSingle(),
      admin
        .from("benefit_definitions")
        .select("id, name, grace_period_days")
        .eq("id", body.benefitDefinitionId)
        .maybeSingle()
    ]);

    if (benefitDef && (benefitDef.grace_period_days ?? 0) > 0 && sub) {
      const startTimestamp = new Date(sub.started_at || sub.created_at).getTime();
      const elapsedDays = (Date.now() - startTimestamp) / (1000 * 60 * 60 * 24);
      if (elapsedDays < benefitDef.grace_period_days) {
        const remainingDays = Math.ceil(benefitDef.grace_period_days - elapsedDays);
        return createProblemResponse({
          type: "https://api.grupoj.com.br/v1/errors/grace-period",
          title: "Benefício em período de carência",
          status: 403,
          detail: `Este benefício requer ${benefitDef.grace_period_days} dias de carência da assinatura. Faltam ${remainingDays} dia(s) para liberação.`
        });
      }
    }
    const { data: activeExisting } = await admin
      .from("benefit_redemptions")
      .select("id, voucher_token, voucher_expires_at")
      .eq("customer_id", customer.id)
      .eq("benefit_definition_id", body.benefitDefinitionId)
      .eq("status", "requested")
      .gt("voucher_expires_at", nowIso)
      .order("voucher_expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeExisting) {
      return createSuccessResponse(
        {
          id: activeExisting.id,
          voucherCode: activeExisting.voucher_token,
          expiresAt: activeExisting.voucher_expires_at
        },
        200
      );
    }

    // 4. Gera código de voucher único (12 caracteres alfanuméricos seguros)
    // Independente de extensões SQL pgcrypto/gen_random_bytes
    const voucherToken = crypto.randomBytes(6).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos

    // 5. Registra o resgate na tabela benefit_redemptions
    const { data: redemption, error: insertError } = await admin
      .from("benefit_redemptions")
      .insert({
        customer_id: customer.id,
        vehicle_id: body.vehicleId,
        workshop_id: workshopId,
        benefit_definition_id: body.benefitDefinitionId,
        status: "requested",
        voucher_token: voucherToken,
        voucher_expires_at: expiresAt
      })
      .select("id, voucher_token, voucher_expires_at")
      .single();

    if (insertError) {
      console.error("[generateVoucher] Erro ao inserir:", insertError.message);
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/voucher-create-failed",
        title: "Voucher não gerado",
        status: 422,
        detail: insertError.message
      });
    }

    return createSuccessResponse(
      {
        id: redemption.id,
        voucherCode: redemption.voucher_token,
        expiresAt: redemption.voucher_expires_at
      },
      201
    );
  } catch (err: unknown) {
    console.error("[generateVoucher] Erro inesperado:", err);
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/voucher-create-failed",
      title: "Voucher não gerado",
      status: 500,
      detail: err instanceof Error ? err.message : "Erro ao emitir voucher."
    });
  }
}
