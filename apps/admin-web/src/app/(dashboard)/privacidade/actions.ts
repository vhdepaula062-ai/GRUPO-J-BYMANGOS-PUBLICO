"use server";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { assertRecentAuthentication } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export interface ErasureActionResult { success: boolean; message: string }
export async function approveErasureRequestAction(requestId: string, userId: string): Promise<ErasureActionResult> {
  const db = await createAuthorizedAdminClient();
  const recent = await assertRecentAuthentication(15);
  if (!recent.success) return { success: false, message: recent.error! };
  const { data: request, error } = await db.from("account_erasure_requests").select("id,user_id,status").eq("id",requestId).single();
  if (error || !request || request.user_id !== userId || !["requested","identity_check"].includes(request.status)) return { success: false, message: "Solicitação ou vínculo do titular inválido." };
  const { error: updateError } = await db.from("account_erasure_requests").update({status:"identity_check",notes:"Em análise: confirmar identidade, escopo e retenção legal antes da eliminação. Nenhum dado foi eliminado."}).eq("id",requestId).eq("status",request.status);
  if (updateError) return { success: false, message: "Não foi possível registrar a análise." };
  revalidatePath("/privacidade");
  return { success: true, message: "Pedido encaminhado para análise de identidade e retenção. A eliminação ainda não foi executada." };
}
export async function rejectErasureRequestAction(requestId: string, reason: string): Promise<ErasureActionResult> {
  const db = await createAuthorizedAdminClient();
  if (!requestId || reason.trim().length < 20 || reason.length > 2000) return {success:false,message:"Informe uma justificativa específica, com pelo menos 20 caracteres, e comunique o titular."};
  const { data, error } = await db.from("account_erasure_requests").update({status:"rejected",notes:reason.trim()}).eq("id",requestId).in("status",["requested","identity_check"]).select("id").maybeSingle();
  if (error || !data) return {success:false,message:"Solicitação não encontrada, já encerrada ou atualização indisponível."};
  revalidatePath("/privacidade");
  return {success:true,message:"Justificativa registrada. O titular deve ser informado pelo canal de atendimento."};
}
