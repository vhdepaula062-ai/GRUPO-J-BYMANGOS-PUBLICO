"use server";

import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { revalidatePath } from "next/cache";
import { isSafeImageUrl, sanitizePlainText } from "@grupo-j/validation";

// ---------------------------------------------------------------------------
// STATUS — Aprovar / Rejeitar
// ---------------------------------------------------------------------------

export async function updatePromotionStatus(promotionId: string, newStatus: "approved" | "rejected") {
  try {
    const supabase = await createAuthorizedAdminClient();

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

// ---------------------------------------------------------------------------
// HELPER — Obter ou garantir organização da rede
// ---------------------------------------------------------------------------

async function getNetworkOrganizationId(): Promise<string> {
  const supabase = await createAuthorizedAdminClient();

  // 1. Procura pela organização oficial da rede
  const { data: networkOrg } = await supabase
    .from("organizations")
    .select("id")
    .ilike("trade_name", "%Rede Credenciada Geral%")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (networkOrg?.id) return networkOrg.id;

  // 2. Procura qualquer organização ativa existente
  const { data: activeOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (activeOrg?.id) return activeOrg.id;

  throw new Error("Cadastre e aprove a organização responsável antes de publicar uma campanha da rede.");
}

// ---------------------------------------------------------------------------
// CREATE — Campanha da rede pelo Admin
// ---------------------------------------------------------------------------

export async function createNetworkPromotion(input: {
  title: string;
  description: string;
  workshopName?: string;
  imageUrl?: string;
  discountPercentage?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}) {
  try {
    const safeTitle = sanitizePlainText(input.title);
    const safeDescription = sanitizePlainText(input.description);
    if (!safeTitle || !safeDescription) {
      return { success: false, error: "Título e descrição são obrigatórios." };
    }

    let validatedImageUrl: string | null = null;
    if (input.imageUrl && input.imageUrl.trim()) {
      if (!isSafeImageUrl(input.imageUrl.trim())) {
        return { success: false, error: "Formato de imagem inválido ou protocolo inseguro." };
      }
      validatedImageUrl = input.imageUrl.trim();
    }

    const supabase = await createAuthorizedAdminClient();
    let workshopId: string | null = null;

    const trimmedName = (input.workshopName || "").trim();

    // Se o admin especificou uma oficina em particular (diferente da abrangência geral)
    if (
      trimmedName &&
      !trimmedName.toLowerCase().includes("rede credenciada") &&
      !trimmedName.toLowerCase().includes("todas as")
    ) {
      const { data: workshop } = await supabase
        .from("organizations")
        .select("id")
        .ilike("trade_name", `%${trimmedName}%`)
        .limit(1)
        .maybeSingle();

      if (workshop?.id) {
        workshopId = workshop.id;
      }
    }

    // Se for campanha geral da rede ou não encontrar oficina específica, ancora na organização da Rede
    if (!workshopId) {
      workshopId = await getNetworkOrganizationId();
    }

    // Datas customizadas ou padrão (hoje + 30 dias)
    const start = input.startDate || new Date().toISOString().slice(0, 10);
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);
    const end = input.endDate || defaultEnd.toISOString().slice(0, 10);

    const fullDescription = validatedImageUrl
      ? `${safeDescription}\n<!--image_url:${validatedImageUrl}-->`
      : safeDescription;

    const payload: Record<string, any> = {
      workshop_id: workshopId,
      title: safeTitle,
      description: fullDescription,
      discount_percentage: input.discountPercentage ?? null,
      start_date: start,
      end_date: end,
      status: "active",
      moderation_notes: validatedImageUrl || null
    };

    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select("id, title, description, status, created_at, start_date, end_date")
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

// ---------------------------------------------------------------------------
// UPDATE — Editar promoção existente
// ---------------------------------------------------------------------------

export async function updatePromotion(
  promotionId: string,
  input: {
    title?: string;
    description?: string;
    imageUrl?: string | null;
    discountPercentage?: number | null;
    startDate?: string;
    endDate?: string;
    status?: string;
  }
) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (input.title !== undefined) updatePayload.title = sanitizePlainText(input.title);
    if (input.discountPercentage !== undefined) updatePayload.discount_percentage = input.discountPercentage;
    if (input.startDate !== undefined) updatePayload.start_date = input.startDate;
    if (input.endDate !== undefined) updatePayload.end_date = input.endDate;
    if (input.status !== undefined) updatePayload.status = input.status;

    if (input.description !== undefined || input.imageUrl !== undefined) {
      // Buscar descrição atual para preservar/atualizar o tag de imagem
      const { data: existing } = await supabase
        .from("promotions")
        .select("description, moderation_notes")
        .eq("id", promotionId)
        .single();

      const rawBaseDesc = input.description !== undefined
        ? input.description
        : (existing?.description?.replace(/<!--image_url:.*?-->/g, "").trim() ?? "");
      const baseDesc = sanitizePlainText(rawBaseDesc);

      let rawImageUrl = input.imageUrl !== undefined
        ? input.imageUrl
        : existing?.moderation_notes ?? null;

      let validatedImg: string | null = null;
      if (rawImageUrl && rawImageUrl.trim()) {
        if (!isSafeImageUrl(rawImageUrl.trim())) {
          return { success: false, error: "Formato de imagem inválido ou protocolo inseguro." };
        }
        validatedImg = rawImageUrl.trim();
      }

      updatePayload.description = validatedImg
        ? `${baseDesc}\n<!--image_url:${validatedImg}-->`
        : baseDesc;
      updatePayload.moderation_notes = validatedImg;
    }

    const { error } = await supabase
      .from("promotions")
      .update(updatePayload)
      .eq("id", promotionId);

    if (error) {
      console.error("[updatePromotion] Error:", error.message);
      return { success: false, error: `Falha ao editar promoção: ${error.message}` };
    }

    revalidatePath("/promocoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updatePromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado ao editar promoção." };
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remover promoção permanentemente
// ---------------------------------------------------------------------------

export async function deletePromotion(promotionId: string) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promotionId);

    if (error) {
      console.error("[deletePromotion] Error:", error.message);
      return { success: false, error: `Falha ao remover promoção: ${error.message}` };
    }

    revalidatePath("/promocoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deletePromotion] Unexpected:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado ao remover promoção." };
  }
}
