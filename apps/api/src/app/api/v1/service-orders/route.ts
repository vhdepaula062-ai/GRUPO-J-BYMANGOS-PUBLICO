import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const { data, error } = await auth.db.from("service_orders").select("id, protocol, status, odometer_km, notes, completed_at, created_at, vehicle:vehicles(plate, brand, model), workshop:organizations(trade_name), redemption:benefit_redemptions(benefit:benefit_definitions(name))").order("created_at", { ascending: false });
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Histórico indisponível", status: 503, detail: error.message });
  return createSuccessResponse(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const body = await request.json();
  if (!body.customerId || !body.vehicleId) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Ordem incompleta", status: 422, detail: "Cliente e veículo são obrigatórios." });
  const { data: membership } = await auth.db.from("organization_members").select("organization_id").eq("user_id", auth.user.id).eq("is_active", true).maybeSingle();
  if (!membership) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/forbidden", title: "Acesso restrito à oficina", status: 403, detail: "O usuário não pertence a uma oficina ativa." });
  const protocol = `OS-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const { data, error } = await auth.db.from("service_orders").insert({ protocol, customer_id: body.customerId, vehicle_id: body.vehicleId, workshop_id: membership.organization_id, redemption_id: body.redemptionId ?? null, odometer_km: body.odometerKm ?? null, notes: body.notes ?? null, opened_by: auth.user.id }).select().single();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/service-order-failed", title: "Ordem não criada", status: 422, detail: error.message });
  return createSuccessResponse(data, 201);
}
