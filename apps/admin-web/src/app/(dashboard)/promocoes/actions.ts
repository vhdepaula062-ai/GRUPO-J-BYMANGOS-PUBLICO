"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePromotionStatus(promotionId: string, newStatus: "approved" | "rejected") {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("promotions")
    .update({
      status: newStatus,
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
