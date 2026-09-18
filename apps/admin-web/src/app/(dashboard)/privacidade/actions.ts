"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { checkIsAdmin, assertRecentAuthentication } from "@/lib/supabase/server";
import { deleteMotoristaAction } from "../clientes/actions";
import { revalidatePath } from "next/cache";

export interface ErasureActionResult {
  success: boolean;
  message: string;
}

/**
 * Aprova e executa a exclusão definitiva do titular de dados (LGPD)
 */
export async function approveErasureRequestAction(
  requestId: string,
  userId: string
): Promise<ErasureActionResult> {
  if (!requestId || !userId) {
    return {
      success: false,
      message: "Dados da requisição inválidos."
    };
  }

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { success: false, message: "Acesso não autorizado. Apenas administradores podem processar exclusões." };
  }

  const recentAuth = await assertRecentAuthentication(15);
  if (!recentAuth.success) {
    return { success: false, message: recentAuth.error || "Reautenticação necessária para executar exclusão de dados." };
  }

  const supabase = createAdminServerClient();

  try {
    // 1. Localiza o customer_id vinculado ao profile (se existir)
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    if (customer?.id) {
      // Executa a remoção completa da conta e dados do motorista
      const delResult = await deleteMotoristaAction(customer.id, userId);
      if (!delResult.success) {
        throw new Error(delResult.message || "Falha ao apagar dados do motorista.");
      }
    } else {
      // Caso seja um usuário sem registro em customers (ex: oficina ou usuário com perfil direto)
      await supabase.from("sessions_metadata").delete().eq("user_id", userId);
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (authErr) {
        console.warn("[approveErasureRequestAction] Auth notice:", authErr);
      }
    }

    // 2. Atualiza o status do pedido de exclusão para 'completed'
    await supabase
      .from("account_erasure_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        notes: "Exclusão executada e aprovada pelo Administrador sob conformidade LGPD."
      })
      .eq("id", requestId);

    revalidatePath("/privacidade");
    revalidatePath("/clientes");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Exclusão de dados aprovada e finalizada com sucesso."
    };
  } catch (error) {
    console.error("[approveErasureRequestAction] Erro:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao processar exclusão LGPD."
    };
  }
}

/**
 * Recusa o pedido de exclusão com justificativa legal
 */
export async function rejectErasureRequestAction(
  requestId: string,
  reason: string
): Promise<ErasureActionResult> {
  if (!requestId) {
    return { success: false, message: "ID da requisição ausente." };
  }

  const supabase = createAdminServerClient();

  try {
    const { error } = await supabase
      .from("account_erasure_requests")
      .update({
        status: "rejected",
        notes: reason || "Pedido recusado por base legal ou ausência de confirmação de identidade."
      })
      .eq("id", requestId);

    if (error) throw error;

    revalidatePath("/privacidade");

    return {
      success: true,
      message: "Solicitação marcada como recusada."
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao recusar solicitação."
    };
  }
}
