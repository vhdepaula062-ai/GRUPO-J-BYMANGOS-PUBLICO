"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBenefitDefinition(formData: {
  name: string;
  slug: string;
  description: string;
  periodicity: string;
  quantityPerCycle: number;
  gracePeriodDays: number;
}) {
  const supabase = createServerSupabaseClient();

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

export async function toggleBenefitStatus(id: string, isActive: boolean) {
  const supabase = createServerSupabaseClient();

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
