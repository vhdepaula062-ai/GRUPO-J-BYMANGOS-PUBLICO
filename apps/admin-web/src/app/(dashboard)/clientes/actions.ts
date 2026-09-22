"use server";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { assertRecentAuthentication } from "@/lib/supabase/server";
export interface DeleteMotoristaResult { success: boolean; message: string }
/** Physical erasure is deliberately blocked until retention and identity are reviewed. */
export async function deleteMotoristaAction(customerId: string, profileId?: string): Promise<DeleteMotoristaResult> {
  const db = await createAuthorizedAdminClient();
  const recent = await assertRecentAuthentication(15);
  if (!recent.success) return { success: false, message: recent.error! };
  const { data, error } = await db.from("customers").select("profile_id").eq("id", customerId).single();
  if (error || !data || (profileId && profileId !== data.profile_id)) return { success: false, message: "Vínculo do titular inválido." };
  return { success: false, message: "Exclusão física bloqueada: processe o pedido em Privacidade, com identidade confirmada e análise de retenção legal. Registros financeiros e evidências não podem ser apagados indiscriminadamente." };
}
