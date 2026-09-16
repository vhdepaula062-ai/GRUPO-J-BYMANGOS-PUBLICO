import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const input = await request.json();
  const allowed: Record<string, unknown> = {};
  for (const [apiKey, dbKey] of Object.entries({ brand: "brand", model: "model", modelYear: "model_year", manufactureYear: "manufacture_year", color: "color", isActive: "is_active" })) if (input[apiKey] !== undefined) allowed[dbKey] = input[apiKey];
  const { data, error } = await auth.db.from("vehicles").update(allowed).eq("id", params.id).eq("customer_id", customerId).select().maybeSingle();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/vehicle-update-failed", title: "Veículo não atualizado", status: 500, detail: error.message });
  if (!data) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/not-found", title: "Veículo não encontrado", status: 404, detail: "O veículo não pertence ao usuário autenticado." });
  return createSuccessResponse(data);
}
