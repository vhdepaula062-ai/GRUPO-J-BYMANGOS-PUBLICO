"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updatePromotionStatus(promotionId: string, newStatus: "approved" | "rejected") {
  try {
    const supabase = createAdminServerClient();

    const { error } = await supabase
      .from("promotions")
      .update({
        status: newStatus === "approved" ? "active" : "rejected",
        updated_at: new Date().toISOString()
      })
      .eq("id", promotionId);

    if (error) {
      console.error("[updatePromotionStatus] Error:", error.message);
      return { success: false, error: `Falha ao atualizar promoção: ${error.message}` };
    }

    revalidatePath("/promocoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updatePromotionStatus] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado ao atualizar status." };
  }
}

export async function createNetworkPromotion(input: {
  title: string;
  description: string;
  workshopName: string;
  imageUrl?: string;
  discountPercentage?: number;
}) {
  try {
    const supabase = createAdminServerClient();
    let workshopId: string | null = null;

    if (input.workshopName && input.workshopName.trim()) {
      const { data: workshop } = await supabase
        .from("organizations")
        .select("id")
        .ilike("trade_name", `%${input.workshopName.trim()}%`)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (workshop) {
        workshopId = workshop.id;
      }
    }

    // Se não encontrar pelo nome, usa a primeira oficina ativa da rede como âncora
    if (!workshopId) {
      const { data: fallbackWorkshop } = await supabase
        .from("organizations")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (fallbackWorkshop) {
        workshopId = fallbackWorkshop.id;
      } else {
        return { success: false, error: "Nenhuma oficina ativa encontrada na rede para ancorar a promoção." };
      }
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const fullDescription = input.imageUrl
      ? `${input.description}\n<!--image_url:${input.imageUrl}-->`
      : input.description;

    const payload: Record<string, any> = {
      workshop_id: workshopId,
      title: input.title,
      description: fullDescription,
      discount_percentage: input.discountPercentage ?? null,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: "active",
      moderation_notes: input.imageUrl || null
    };

    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select("id, title, description, status, created_at")
      .single();

    if (error || !data) {
      console.error("[createNetworkPromotion] Error:", error?.message);
      return { success: false, error: `Falha ao publicar promoção: ${error?.message}` };
    }

    revalidatePath("/promocoes");
    revalidatePath("/dashboard");
    return { success: true, promotion: data };
  } catch (err: unknown) {
    console.error("[createNetworkPromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado ao criar promoção." };
  }
}
