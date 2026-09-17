"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createHmac } from "crypto";

export interface ModerateWorkshopResult {
  success: boolean;
  message: string;
  status: string;
}

/**
 * Server Action para o Joaquim aprovar, suspender ou recusar propostas de oficinas
 */
export async function moderateWorkshopAction(
  workshopId: string,
  newStatus: "active" | "inactive" | "suspended" | "pending_approval"
): Promise<ModerateWorkshopResult> {
  const supabase = createAdminServerClient();

  try {
    const { error } = await supabase
      .from("organizations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", workshopId);

    if (error) {
      throw new Error(`Falha ao atualizar oficina: ${error.message}`);
    }

    revalidatePath("/oficinas");
    revalidatePath("/dashboard");
    revalidatePath("/painel");

    const statusText =
      newStatus === "active"
        ? "credenciada e ativada na rede"
        : newStatus === "inactive"
        ? "recusada / desativada"
        : newStatus === "suspended"
        ? "suspensa temporariamente"
        : "definida como pendente";

    return {
      success: true,
      message: `Oficina ${statusText} com sucesso!`,
      status: newStatus
    };
  } catch (err) {
    console.error("[moderateWorkshopAction] error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Falha ao atualizar o status da oficina.",
      status: newStatus
    };
  }
}

export interface DirectWorkshopData {
  tradeName: string;
  legalName?: string;
  cnpj: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
}

/**
 * Server Action para o Joaquim cadastrar uma oficina diretamente com status ativo
 */
export async function createDirectWorkshopAction(data: DirectWorkshopData): Promise<{
  success: boolean;
  message: string;
  workshop?: Record<string, unknown>;
}> {
  const supabase = createAdminServerClient();

  const cleanCnpj = data.cnpj.replace(/\D/g, "");
  const maskedCnpj =
    cleanCnpj.length === 14
      ? cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
      : data.cnpj.trim();

  if (cleanCnpj.length !== 14) throw new Error("CNPJ inválido.");
  const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
  if (!pepper) throw new Error("Chave de proteção de documentos não configurada.");
  const blindIndex = createHmac("sha256", pepper).update(`cnpj:${cleanCnpj}`).digest("hex");

  try {
    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        legal_name: data.legalName?.trim() || data.tradeName.trim(),
        trade_name: data.tradeName.trim(),
        cnpj_masked: maskedCnpj,
        cnpj_blind_index: blindIndex,
        status: "active", // Direto pelo admin nasce ativa
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Falha ao cadastrar oficina: ${error.message}`);
    }

    if (org?.id && data.city) {
      const { error: unitError } = await supabase.from("organization_units").insert({
        organization_id: org.id,
        name: `${data.tradeName.trim()} — Matriz`,
        is_headquarters: true,
        address_street: "Endereço Cadastrado",
        address_number: "S/N",
        address_neighborhood: "Centro",
        address_city: data.city.trim(),
        address_state: (data.state || "RJ").trim().toUpperCase(),
        address_zip_code: "00000-000"
      });
      if (unitError) {
        await supabase.from("organizations").delete().eq("id", org.id);
        throw new Error(`Falha ao cadastrar unidade: ${unitError.message}`);
      }
    }

    revalidatePath("/oficinas");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Oficina ${data.tradeName} credenciada e ativada na rede com sucesso!`,
      workshop: org
    };
  } catch (err) {
    console.error("[createDirectWorkshopAction] error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Falha ao cadastrar a oficina."
    };
  }
}

export interface DecommissionWorkshopOptions {
  workshopId: string;
  fallbackWorkshopId?: string;
  deletePermanently?: boolean;
}

export async function getAssignedMotoristasCount(workshopId: string): Promise<number> {
  const supabase = createAdminServerClient();
  const { count } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("assigned_workshop_id", workshopId);
  return count ?? 0;
}

/**
 * Descredencia ou remove uma oficina parceira, realocando com segurança
 * os motoristas vinculados para uma oficina ativa de transição.
 */
export async function decommissionWorkshopAction(
  options: DecommissionWorkshopOptions
): Promise<{ success: boolean; message: string }> {
  const { workshopId, fallbackWorkshopId, deletePermanently } = options;
  const supabase = createAdminServerClient();

  try {
    // 1. Realoca os motoristas caso haja oficina substituta
    if (fallbackWorkshopId && fallbackWorkshopId !== workshopId) {
      const { data: customers } = await supabase
        .from("customers")
        .select("id")
        .eq("assigned_workshop_id", workshopId);

      const customerIds = (customers ?? []).map((c: { id: string }) => c.id);

      if (customerIds.length > 0) {
        await supabase
          .from("customers")
          .update({
            assigned_workshop_id: fallbackWorkshopId,
            workshop_assigned_at: new Date().toISOString()
          })
          .in("id", customerIds);

        const historyRows = customerIds.map((cid: string) => ({
          customer_id: cid,
          previous_workshop_id: workshopId,
          new_workshop_id: fallbackWorkshopId,
          assigned_at: new Date().toISOString(),
          reason: "Realocação automática pelo Administrador devido ao descredenciamento da oficina de origem."
        }));

        await supabase.from("workshop_assignment_history").insert(historyRows);
      }
    } else {
      await supabase
        .from("customers")
        .update({ assigned_workshop_id: null })
        .eq("assigned_workshop_id", workshopId);
    }

    // 2. Se for exclusão física ou desativação
    if (deletePermanently) {
      await supabase.from("organization_units").delete().eq("organization_id", workshopId);
      await supabase.from("organization_members").delete().eq("organization_id", workshopId);
      await supabase.from("workshop_profiles").delete().eq("organization_id", workshopId);
      await supabase.from("workshop_documents").delete().eq("organization_id", workshopId);
      await supabase.from("workshop_services").delete().eq("organization_id", workshopId);
      await supabase.from("promotions").delete().eq("organization_id", workshopId);

      const { error: delErr } = await supabase.from("organizations").delete().eq("id", workshopId);
      if (delErr) {
        // Se houver ordens de serviço históricas, desativa para preservar integridade contábil
        await supabase
          .from("organizations")
          .update({ status: "inactive", updated_at: new Date().toISOString() })
          .eq("id", workshopId);
      }
    } else {
      await supabase
        .from("organizations")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", workshopId);
    }

    revalidatePath("/oficinas");
    revalidatePath("/dashboard");
    revalidatePath("/clientes");

    return {
      success: true,
      message: "Oficina descredenciada e motoristas devidamente realocados!"
    };
  } catch (err) {
    console.error("[decommissionWorkshopAction] Erro:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Erro ao descredenciar a oficina."
    };
  }
}

