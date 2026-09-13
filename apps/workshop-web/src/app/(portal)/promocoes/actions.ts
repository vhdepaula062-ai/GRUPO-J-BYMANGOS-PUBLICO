"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function createWorkshopPromotionAction(data: {
  title: string;
  description: string;
  discountPercentage?: number;
}) {
  const workshopData = await getMyWorkshop();
  if (!workshopData || !workshopData.organization) {
    throw new Error("Oficina não identificada.");
  }

  const workshopId = (workshopData.organization as { id: string }).id;
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("promotions").insert({
    organization_id: workshopId,
    title: data.title,
    description: data.description,
    status: "pending_review",
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error("[createWorkshopPromotionAction]", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/promocoes");
  return { success: true };
}
