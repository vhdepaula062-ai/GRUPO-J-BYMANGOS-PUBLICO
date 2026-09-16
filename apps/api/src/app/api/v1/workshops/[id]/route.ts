import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await getPublicDatabase().from("organizations").select("id, trade_name, email, phone, status, workshop_profiles(*), organization_units(*), workshop_services(id, service_name, description, price_cents)").eq("id", params.id).eq("status", "active").maybeSingle();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Oficina indisponível", status: 503, detail: error.message });
  if (!data) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/not-found", title: "Oficina não encontrada", status: 404, detail: "A oficina não existe ou não está ativa." });
  return createSuccessResponse(data);
}
