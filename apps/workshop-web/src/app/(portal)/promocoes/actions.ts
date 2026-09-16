"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function createWorkshopPromotionAction(data: {
  title: string;
  description: string;
  imageUrl?: string;
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

  const fullDescription = data.imageUrl
    ? `${data.description}\n<!--image_url:${data.imageUrl}-->`
    : data.description;

  const payload: Record<string, any> = {
    workshop_id: workshopId,
    title: data.title,
    description: fullDescription,
    discount_percentage: data.discountPercentage ?? null,
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    status: "pending_approval",
    moderation_notes: data.imageUrl || null
  };

  let { error } = await supabase.from("promotions").insert({
    ...payload,
    image_url: data.imageUrl || null
  });

  if (error && error.message?.includes("image_url")) {
    const retry = await supabase.from("promotions").insert(payload);
    error = retry.error;
  }

  if (error) {
    console.error("[createWorkshopPromotionAction]", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/promocoes");
  return { success: true };
}
