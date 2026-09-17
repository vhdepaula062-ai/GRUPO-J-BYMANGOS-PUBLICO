"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface DeleteMotoristaResult {
  success: boolean;
  message: string;
}

/**
 * Server Action para o Administrador remover um motorista,
 * apagando completamente a conta e todos os dados associados
 * (banco de dados relacional + Supabase Auth).
 */
export async function deleteMotoristaAction(
  customerId: string,
  profileId?: string
): Promise<DeleteMotoristaResult> {
  if (!customerId) {
    return {
      success: false,
      message: "ID do motorista não informado."
    };
  }

  const supabase = createAdminServerClient();

  try {
    // 1. Identifica e garante o profileId associado
    let resolvedProfileId = profileId;
    if (!resolvedProfileId) {
      const { data: customerRow } = await supabase
        .from("customers")
        .select("id, profile_id")
        .eq("id", customerId)
        .maybeSingle();

      resolvedProfileId = customerRow?.profile_id;
    }

    // 2. Tenta exclusão atômica via Stored Procedure no PostgreSQL
    let rpcSucceeded = false;
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "delete_motorista_completely",
        {
          p_customer_id: customerId,
          p_profile_id: resolvedProfileId || null
        }
      );

      if (!rpcError && (rpcData as any)?.success) {
        rpcSucceeded = true;
      } else if (rpcError) {
        console.warn("[deleteMotoristaAction] RPC falhou ou não existe, executando exclusão direta:", rpcError.message);
      }
    } catch (rpcEx) {
      console.warn("[deleteMotoristaAction] Exceção ao tentar RPC, executando fallback direto:", rpcEx);
    }

    // 3. Fallback: Exclusão em cascata controlada caso o RPC ainda não tenha sido aplicado no banco
    if (!rpcSucceeded) {
      // 3.1. Coleta IDs de assinaturas, métodos de pagamento e veículos
      const [
        { data: subs },
        { data: payCusts },
        { data: vehs }
      ] = await Promise.all([
        supabase.from("subscriptions").select("id").eq("customer_id", customerId),
        supabase.from("payment_customers").select("id").eq("customer_id", customerId),
        supabase.from("vehicles").select("id").eq("customer_id", customerId)
      ]);

      const subIds = (subs ?? []).map((s: { id: string }) => s.id);
      const payCustIds = (payCusts ?? []).map((p: { id: string }) => p.id);
      const vehicleIds = (vehs ?? []).map((v: { id: string }) => v.id);

      // 3.2. Exclui dependências financeiras de assinaturas
      if (subIds.length > 0) {
        await supabase.from("invoices").delete().in("subscription_id", subIds);
        await supabase.from("payments").delete().in("subscription_id", subIds);
        await supabase.from("discounts").delete().in("subscription_id", subIds);
        await supabase.from("subscription_status_history").delete().in("subscription_id", subIds);
        await supabase.from("subscriptions").delete().in("id", subIds);
      }

      // 3.3. Exclui métodos de pagamento e clientes de pagamento
      if (payCustIds.length > 0) {
        await supabase.from("payment_methods").delete().in("payment_customer_id", payCustIds);
        await supabase.from("payment_customers").delete().in("id", payCustIds);
      }

      // 3.4. Exclui ordens de serviço e resgates de benefícios
      await supabase.from("service_orders").delete().eq("customer_id", customerId);
      if (vehicleIds.length > 0) {
        await supabase.from("service_orders").delete().in("vehicle_id", vehicleIds);
      }

      await supabase.from("benefit_redemptions").delete().eq("customer_id", customerId);
      if (vehicleIds.length > 0) {
        await supabase.from("benefit_redemptions").delete().in("vehicle_id", vehicleIds);
      }

      // 3.5. Exclui agendamentos se a tabela existir
      try {
        await supabase.from("appointments").delete().eq("customer_id", customerId);
        if (vehicleIds.length > 0) {
          await supabase.from("appointments").delete().in("vehicle_id", vehicleIds);
        }
      } catch {
        // Tabela opcional/não bloqueante
      }

      // 3.6. Exclui direitos e ciclos
      await supabase.from("entitlements").delete().eq("customer_id", customerId);
      await supabase.from("entitlement_cycles").delete().eq("customer_id", customerId);

      // 3.7. Exclui vínculos de oficina
      await supabase.from("workshop_assignments").delete().eq("customer_id", customerId);
      await supabase.from("workshop_assignment_history").delete().eq("customer_id", customerId);

      // 3.8. Exclui veículos e histórico de posse
      await supabase.from("vehicle_ownership_history").delete().eq("new_customer_id", customerId);
      await supabase.from("vehicle_ownership_history").delete().eq("previous_customer_id", customerId);
      if (vehicleIds.length > 0) {
        await supabase.from("vehicle_ownership_history").delete().in("vehicle_id", vehicleIds);
      }
      await supabase.from("vehicles").delete().eq("customer_id", customerId);

      // 3.9. Exclui contatos e endereços
      await supabase.from("customer_contacts").delete().eq("customer_id", customerId);
      await supabase.from("customer_addresses").delete().eq("customer_id", customerId);

      // 3.10. Exclui cliente
      const { error: deleteCustomerError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (deleteCustomerError) {
        console.error("[deleteMotoristaAction] Erro ao excluir cliente:", deleteCustomerError);
        throw new Error(`Erro ao excluir cliente: ${deleteCustomerError.message}`);
      }

      // 3.11. Limpa registros associados ao perfil do motorista
      if (resolvedProfileId) {
        await supabase.from("account_erasure_requests").delete().eq("user_id", resolvedProfileId);
        await supabase.from("sessions_metadata").delete().eq("user_id", resolvedProfileId);
        await supabase.from("user_roles").delete().eq("user_id", resolvedProfileId);

        // Desassocia logs de auditoria do ator sem quebrar FK
        await supabase
          .from("audit_logs")
          .update({ actor_user_id: null })
          .eq("actor_user_id", resolvedProfileId);

        await supabase.from("profiles").delete().eq("id", resolvedProfileId);
      }
    }

    // 4. Exclui permanentemente o usuário do Supabase Auth (login & credenciais)
    if (resolvedProfileId) {
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(resolvedProfileId);
        if (authError) {
          console.warn("[deleteMotoristaAction] Aviso ao excluir de auth.users:", authError.message);
        } else {
          console.info(`[deleteMotoristaAction] Usuário de auth ${resolvedProfileId} removido com sucesso.`);
        }
      } catch (authEx) {
        console.warn("[deleteMotoristaAction] Exceção ao remover de auth.users:", authEx);
      }
    }

    // 5. Registra log de auditoria administrativo
    try {
      await supabase.from("audit_logs").insert({
        entity_name: "customer",
        entity_id: customerId,
        action: "hard_delete",
        reason: "Motorista e conta apagados definitivamente pelo Administrador.",
        old_values: {
          customer_id: customerId,
          profile_id: resolvedProfileId ?? null
        }
      });
    } catch {
      // Falha não impeditiva
    }

    // 6. Revalida caches do painel
    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    revalidatePath("/painel");
    revalidatePath("/assinaturas");

    return {
      success: true,
      message: "Motorista e todos os seus dados foram excluídos definitivamente do sistema."
    };
  } catch (error) {
    console.error("[deleteMotoristaAction] Erro:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao remover motorista."
    };
  }
}
