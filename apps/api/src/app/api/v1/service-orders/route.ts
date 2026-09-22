import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { z } from "@grupo-j/validation";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  redemptionId: z.string().uuid().nullable().optional(),
  odometerKm: z.number().int().min(0).max(10_000_000).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
}).strict();

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const { data, error } = await auth.db.from("service_orders").select("id, protocol, status, odometer_km, notes, completed_at, created_at, vehicle:vehicles(plate, brand, model), workshop:organizations(trade_name), redemption:benefit_redemptions(benefit:benefit_definitions(name))").order("created_at", { ascending: false });
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Histórico indisponível", status: 503, detail: error.message });
  return createSuccessResponse(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Dados da ordem inválidos", status: 422, detail: "Confira cliente, veículo e dados do atendimento." });
  const body = parsed.data;
  const { data: membership } = await auth.db.from("organization_members").select("organization_id").eq("user_id", auth.user.id).eq("is_active", true).maybeSingle();
  if (!membership) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/forbidden", title: "Acesso restrito à oficina", status: 403, detail: "O usuário não pertence a uma oficina ativa." });
  const protocol = `OS-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const { data, error } = await auth.db.from("service_orders").insert({ protocol, customer_id: body.customerId, vehicle_id: body.vehicleId, workshop_id: membership.organization_id, redemption_id: body.redemptionId ?? null, odometer_km: body.odometerKm ?? null, notes: body.notes ?? null, opened_by: auth.user.id }).select().single();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/service-order-failed", title: "Ordem não criada", status: 422, detail: "Confira o vínculo da oficina, do cliente e do veículo." });
  return createSuccessResponse(data, 201);
}
