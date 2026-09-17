"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { getMyWorkshop } from "@/lib/queries";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveWorkshopId(): Promise<string | null> {
  const workshopData = await getMyWorkshop();
  let workshopId = (workshopData?.organization as { id?: string } | undefined)?.id ?? null;

  if (!workshopId) {
    const adminDb = createAdminServerClient();
    const { data: defaultOrg } = await adminDb
      .from("organizations")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    workshopId = defaultOrg?.id ?? null;
  }

  return workshopId;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createWorkshopPromotionAction(data: {
  title: string;
  description: string;
  imageUrl?: string;
  discountPercentage?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}) {
  try {
    const workshopId = await resolveWorkshopId();
    if (!workshopId) return { success: false, error: "Oficina não identificada." };

    const supabase = createAdminServerClient();

    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);

    const startDate = data.startDate || new Date().toISOString().slice(0, 10);
    const endDate = data.endDate || defaultEnd.toISOString().slice(0, 10);

    const fullDescription = data.imageUrl
      ? `${data.description}\n<!--image_url:${data.imageUrl}-->`
      : data.description;

    const payload: Record<string, any> = {
      workshop_id: workshopId,
      title: data.title,
      description: fullDescription,
      discount_percentage: data.discountPercentage ?? null,
      start_date: startDate,
      end_date: endDate,
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

// ---------------------------------------------------------------------------
// DELETE — Remover promoção permanentemente (apenas da própria oficina)
// ---------------------------------------------------------------------------

export async function deleteWorkshopPromotion(promotionId: string) {
  try {
    const workshopId = await resolveWorkshopId();
    if (!workshopId) return { success: false, error: "Oficina não identificada." };

    const supabase = createAdminServerClient();

    // Garante que só remove promoções da sua própria oficina
    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promotionId)
      .eq("workshop_id", workshopId);

    if (error) {
      console.error("[deleteWorkshopPromotion]", error.message);
      return { success: false, error: `Falha ao remover: ${error.message}` };
    }

    revalidatePath("/promocoes");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteWorkshopPromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

// ---------------------------------------------------------------------------
// SUSPEND — Suspender promoção (invisível no app, mas mantida no banco)
// ---------------------------------------------------------------------------

export async function suspendWorkshopPromotion(promotionId: string) {
  try {
    const workshopId = await resolveWorkshopId();
    if (!workshopId) return { success: false, error: "Oficina não identificada." };

    const supabase = createAdminServerClient();

    const { error } = await supabase
      .from("promotions")
      .update({ status: "suspended", updated_at: new Date().toISOString() })
      .eq("id", promotionId)
      .eq("workshop_id", workshopId);

    if (error) {
      console.error("[suspendWorkshopPromotion]", error.message);
      return { success: false, error: `Falha ao suspender: ${error.message}` };
    }

    revalidatePath("/promocoes");
    return { success: true };
  } catch (err: unknown) {
    console.error("[suspendWorkshopPromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

// ---------------------------------------------------------------------------
// REACTIVATE — Reativar promoção suspensa (volta para pending_approval)
// ---------------------------------------------------------------------------

export async function reactivateWorkshopPromotion(promotionId: string) {
  try {
    const workshopId = await resolveWorkshopId();
    if (!workshopId) return { success: false, error: "Oficina não identificada." };

    const supabase = createAdminServerClient();

    const { error } = await supabase
      .from("promotions")
      .update({ status: "pending_approval", updated_at: new Date().toISOString() })
      .eq("id", promotionId)
      .eq("workshop_id", workshopId);

    if (error) {
      console.error("[reactivateWorkshopPromotion]", error.message);
      return { success: false, error: `Falha ao reativar: ${error.message}` };
    }

    revalidatePath("/promocoes");
    return { success: true };
  } catch (err: unknown) {
    console.error("[reactivateWorkshopPromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}
