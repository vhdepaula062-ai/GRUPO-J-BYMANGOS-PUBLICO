"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePromotionStatus(promotionId: string, newStatus: "approved" | "rejected") {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("promotions")
    .update({
      status: newStatus === "approved" ? "active" : "rejected",
      updated_at: new Date().toISOString()
    })
    .eq("id", promotionId);

  if (error) {
    console.error("[updatePromotionStatus] Error:", error.message);
    throw new Error(`Falha ao atualizar promoção: ${error.message}`);
  }

  revalidatePath("/promocoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createNetworkPromotion(input: {
  title: string;
  description: string;
  workshopName: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data: workshop, error: workshopError } = await supabase
    .from("organizations")
    .select("id")
    .ilike("trade_name", input.workshopName.trim())
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (workshopError || !workshop) {
    throw new Error("Informe o nome exato de uma oficina ativa da rede.");
  }

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      workshop_id: workshop.id,
      title: input.title,
      description: input.description,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: "active"
    })
    .select("id, title, description, status, created_at")
    .single();

  if (error) throw new Error(`Falha ao publicar promoção: ${error.message}`);
  revalidatePath("/promocoes");
  return data;
}
