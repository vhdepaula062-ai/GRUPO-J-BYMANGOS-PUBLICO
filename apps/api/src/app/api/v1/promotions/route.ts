import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await getPublicDatabase().from("promotions").select("id, title, description, discount_percentage, price_cents, start_date, end_date, workshop:organizations(id, trade_name)").eq("status", "active").lte("start_date", today).gte("end_date", today).order("end_date");
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Promoções indisponíveis", status: 503, detail: error.message });
  return createSuccessResponse(data ?? [], 200, { total: data?.length ?? 0 });
}
