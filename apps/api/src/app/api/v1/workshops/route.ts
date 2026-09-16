import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const city = new URL(request.url).searchParams.get("city");
  let query = getPublicDatabase().from("organizations").select("id, trade_name, email, phone, status, workshop_profiles(description, rating_average, rating_count, operating_hours, is_open_now), organization_units(id, name, address_street, address_number, address_neighborhood, address_city, address_state, address_zip_code, latitude, longitude)").eq("status", "active").order("trade_name");
  if (city) query = query.eq("organization_units.address_city", city);
  const { data, error } = await query;
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Oficinas indisponíveis", status: 503, detail: error.message });
  return createSuccessResponse(data ?? [], 200, { total: data?.length ?? 0 });
}
