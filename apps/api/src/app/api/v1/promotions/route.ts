import { NextRequest } from "next/server";
import { getAdminDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const db = getAdminDatabase();

  const { data, error } = await db
    .from("promotions")
    .select("id, title, description, discount_percentage, price_cents, start_date, end_date, moderation_notes, workshop:organizations(id, trade_name)")
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date");

  if (error) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/query-failed",
      title: "Promoções indisponíveis",
      status: 503,
      detail: error.message
    });
  }

  const sanitized = (data ?? []).map((promo: Record<string, any>) => {
    let imageUrl: string | null = null;
    let cleanDesc = promo.description || "";

    const match = cleanDesc.match(/<!--image_url:(.*?)-->/);
    if (match && match[1]) {
      imageUrl = match[1].trim();
      cleanDesc = cleanDesc.replace(/<!--image_url:.*?-->/, "").trim();
    } else if (promo.moderation_notes && (promo.moderation_notes.startsWith("http") || promo.moderation_notes.startsWith("data:image"))) {
      imageUrl = promo.moderation_notes.trim();
    }

    return {
      id: promo.id,
      title: promo.title,
      description: cleanDesc,
      image_url: imageUrl,
      discount_percentage: promo.discount_percentage,
      price_cents: promo.price_cents,
      start_date: promo.start_date,
      end_date: promo.end_date,
      workshop: promo.workshop
    };
  });

  return createSuccessResponse(sanitized, 200, { total: sanitized.length });
}

