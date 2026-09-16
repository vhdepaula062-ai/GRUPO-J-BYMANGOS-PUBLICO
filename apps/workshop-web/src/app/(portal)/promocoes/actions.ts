"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { getMyWorkshop } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function createWorkshopPromotionAction(data: {
  title: string;
  description: string;
  imageUrl?: string;
  discountPercentage?: number;
}) {
  try {
    const workshopData = await getMyWorkshop();
    let workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

    if (!workshopId) {
      const adminDb = createAdminServerClient();
      const { data: defaultOrg } = await adminDb
        .from("organizations")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (defaultOrg) {
        workshopId = defaultOrg.id;
      } else {
        return { success: false, error: "Oficina não identificada." };
      }
    }

    const supabase = createAdminServerClient();
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

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

    const { error } = await supabase.from("promotions").insert(payload);

    if (error) {
      console.error("[createWorkshopPromotionAction]", error.message);
      return { success: false, error: `Falha ao salvar a promoção: ${error.message}` };
    }

    revalidatePath("/promocoes");
    return { success: true };
  } catch (err: unknown) {
    console.error("[createWorkshopPromotionAction] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado ao salvar promoção." };
  }
}
