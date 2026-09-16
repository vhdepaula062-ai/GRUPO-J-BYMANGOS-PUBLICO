import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const { data: customer, error } = await auth.db.from("customers").select(`
    id, assigned_workshop_id, workshop_assigned_at, next_workshop_change_allowed_at,
    profile:profiles(id, full_name, email, phone, cpf_masked),
    vehicles(id, plate, brand, model, model_year, manufacture_year, color, is_active),
    subscriptions(id, status, current_period_start, current_period_end, cancel_at_period_end, plan:plans(name, price_cents, currency)),
    workshop:organizations(id, trade_name, phone, organization_units(address_street, address_number, address_neighborhood, address_city, address_state))
  `).eq("profile_id", auth.user.id).single();
  if (error || !customer) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/customer-not-found", title: "Cadastro não encontrado", status: 404, detail: "O usuário autenticado não possui cadastro de motorista." });
  return createSuccessResponse(customer);
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const protocol = `LGPD-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const { data, error } = await auth.db.from("account_erasure_requests").insert({ user_id: auth.user.id, protocol, deadline_at: new Date(Date.now() + 15 * 86400000).toISOString() }).select("protocol, status, deadline_at").single();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/erasure-request-failed", title: "Solicitação não registrada", status: 500, detail: error.message });
  return createSuccessResponse(data, 202);
}
