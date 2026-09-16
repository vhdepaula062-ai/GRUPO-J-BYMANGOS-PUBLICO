import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest) {
  const { data, error } = await getPublicDatabase().from("plans").select("id, code, name, description, audience, price_cents, currency, billing_interval_months, version").eq("is_active", true).order("price_cents");
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/query-failed", title: "Planos indisponíveis", status: 503, detail: error.message });
  return createSuccessResponse(data ?? []);
}
