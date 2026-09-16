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
  const startDate = new Date();
  const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 30);

  const { error } = await supabase.from("promotions").insert({
    workshop_id: workshopId,
    title: data.title,
    description: data.description,
    discount_percentage: data.discountPercentage ?? null,
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    status: "pending_approval"
  });

  if (error) {
    console.error("[createWorkshopPromotionAction]", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/promocoes");
  return { success: true };
}
