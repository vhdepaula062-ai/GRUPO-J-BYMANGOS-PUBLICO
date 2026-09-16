"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";

export async function updateWorkshopProfile(input: {
  tradeName: string;
  legalName: string;
  email: string;
  phone: string;
}) {
  const workshop = await getMyWorkshop();
  const organizationId = workshop?.organization?.id as string | undefined;
  if (!organizationId) throw new Error("Oficina não identificada.");
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("organizations").update({
    trade_name: input.tradeName.trim(),
    legal_name: input.legalName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    updated_at: new Date().toISOString()
  }).eq("id", organizationId);
  if (error) throw new Error(`Falha ao atualizar cadastro: ${error.message}`);
  revalidatePath("/configuracoes");
  return { success: true };
}
