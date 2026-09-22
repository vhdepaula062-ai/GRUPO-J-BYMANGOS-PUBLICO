"use server";

import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createBenefitDefinition(formData: {
  name: string;
  slug: string;
  description: string;
  periodicity: string;
  quantityPerCycle: number;
  gracePeriodDays: number;
}) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase.from("benefit_definitions").insert({
    name: formData.name,
    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
    description: formData.description,
    periodicity: formData.periodicity,
    quantity_per_cycle: formData.quantityPerCycle || 1,
    grace_period_days: formData.gracePeriodDays || 0,
    is_active: true
  });

  if (error) {
    console.error("[createBenefitDefinition]", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/beneficios");
  return { success: true };
}

// ---------------------------------------------------------------------------
// TOGGLE STATUS
// ---------------------------------------------------------------------------

export async function toggleBenefitStatus(id: string, isActive: boolean) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase
    .from("benefit_definitions")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[toggleBenefitStatus]", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/beneficios");
  return { success: true };
}

// ---------------------------------------------------------------------------
// UPDATE — Editar benefício existente
// ---------------------------------------------------------------------------

export async function updateBenefitDefinition(
  id: string,
  formData: {
    name?: string;
    slug?: string;
    description?: string;
    periodicity?: string;
    quantityPerCycle?: number;
    gracePeriodDays?: number;
  }
) {
  const supabase = await createAuthorizedAdminClient();

  const updatePayload: Record<string, any> = {};
  if (formData.name !== undefined) updatePayload.name = formData.name;
  if (formData.slug !== undefined) updatePayload.slug = formData.slug;
  if (formData.description !== undefined) updatePayload.description = formData.description;
  if (formData.periodicity !== undefined) updatePayload.periodicity = formData.periodicity;
  if (formData.quantityPerCycle !== undefined) updatePayload.quantity_per_cycle = formData.quantityPerCycle;
  if (formData.gracePeriodDays !== undefined) updatePayload.grace_period_days = formData.gracePeriodDays;

  const { error } = await supabase
    .from("benefit_definitions")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("[updateBenefitDefinition]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/beneficios");
  return { success: true };
}

// ---------------------------------------------------------------------------
// DELETE — Excluir benefício permanentemente
// ---------------------------------------------------------------------------

export async function deleteBenefitDefinition(id: string) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase
    .from("benefit_definitions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteBenefitDefinition]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/beneficios");
  return { success: true };
}
