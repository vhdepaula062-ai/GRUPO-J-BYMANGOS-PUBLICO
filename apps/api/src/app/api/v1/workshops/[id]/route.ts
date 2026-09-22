import { NextRequest } from "next/server";
import { getAdminDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { data, error } = await getAdminDatabase().from("organizations").select("id, trade_name, status, workshop_profiles(description,rating_average,rating_count,operating_hours,is_open_now), organization_units(id,name,address_street,address_number,address_neighborhood,address_city,address_state,address_zip_code,latitude,longitude), workshop_services(id, service_name, description, price_cents)").eq("id", (await params).id).eq("status", "active").maybeSingle();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Oficina indisponível", status: 503, detail: error.message });
  if (!data) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/not-found", title: "Oficina não encontrada", status: 404, detail: "A oficina não existe ou não está ativa." });
  return createSuccessResponse(data);
}
