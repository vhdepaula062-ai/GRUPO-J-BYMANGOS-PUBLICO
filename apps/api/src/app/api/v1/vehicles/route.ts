import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const { data, error } = await auth.db.from("vehicles").select("id, plate, brand, model, model_year, manufacture_year, color, renavam_masked, is_active, created_at").eq("customer_id", customerId).eq("is_active", true).order("created_at");
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Veículos indisponíveis", status: 500, detail: error.message });
  return createSuccessResponse(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const plate = String(body.plate ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) || !body.brand || !body.model || !body.modelYear) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Dados do veículo inválidos", status: 422, detail: "Informe placa brasileira, marca, modelo e ano." });
    }
    const customerId = await getCustomerId(auth.db, auth.user.id);
    const renavam = String(body.renavam ?? "").replace(/\D/g, "");
    const { data, error } = await auth.db.from("vehicles").insert({ customer_id: customerId, plate, plate_clean: plate, brand: String(body.brand).trim(), model: String(body.model).trim(), model_year: Number(body.modelYear), manufacture_year: Number(body.manufactureYear ?? body.modelYear), color: String(body.color ?? "Não informada"), renavam_masked: renavam ? `${renavam.slice(0, 3)}****${renavam.slice(-2)}` : null }).select().single();
    if (error) throw error;
    return createSuccessResponse(data, 201);
  } catch (error) { return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/vehicle-create-failed", title: "Não foi possível cadastrar o veículo", status: 500, detail: error instanceof Error ? error.message : "Erro interno" }); }
}
