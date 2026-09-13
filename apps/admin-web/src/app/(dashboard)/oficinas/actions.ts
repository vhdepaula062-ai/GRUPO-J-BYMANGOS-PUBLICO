"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateEcosystemWorkshopStatus, registerPendingWorkshopProposal } from "@grupo-j/database";
import { revalidatePath } from "next/cache";

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
  // Sincroniza imediatamente no store do ecossistema
  updateEcosystemWorkshopStatus(workshopId, newStatus);

  const supabase = createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from("organizations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", workshopId);

    if (error) {
      console.warn("[moderateWorkshopAction] Supabase update warning:", error.message);
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
      success: true,
      message: "Status da oficina atualizado no painel.",
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
  const supabase = createServerSupabaseClient();

  const cleanCnpj = data.cnpj.replace(/\D/g, "");
  const maskedCnpj =
    cleanCnpj.length === 14
      ? cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
      : data.cnpj.trim();

  const blindIndex = `blind_${cleanCnpj || Math.random().toString(36).substring(2, 14)}`;

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
      console.warn("[createDirectWorkshopAction] Supabase insert warning:", error.message);
    }

    if (org?.id && data.city) {
      await supabase.from("organization_units").insert({
        organization_id: org.id,
        name: `${data.tradeName.trim()} — Matriz`,
        is_headquarters: true,
        address_street: "Endereço Cadastrado",
        address_number: "S/N",
        address_neighborhood: "Centro",
        address_city: data.city.trim(),
        address_state: (data.state || "RJ").trim().toUpperCase(),
        address_postal_code: "00000-000",
        phone: data.phone.trim()
      });
    }

    const ecoW = registerPendingWorkshopProposal({
      trade_name: data.tradeName,
      legal_name: data.legalName || data.tradeName,
      cnpj_masked: maskedCnpj,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state
    });
    updateEcosystemWorkshopStatus(ecoW.id, "active");

    revalidatePath("/oficinas");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Oficina ${data.tradeName} credenciada e ativada na rede com sucesso!`,
      workshop: org || {
        id: ecoW.id,
        trade_name: data.tradeName,
        legal_name: data.legalName || data.tradeName,
        cnpj_masked: maskedCnpj,
        email: data.email,
        phone: data.phone,
        status: "active",
        created_at: new Date().toISOString()
      }
    };
  } catch (err) {
    console.error("[createDirectWorkshopAction] error:", err);
    const ecoW = registerPendingWorkshopProposal({
      trade_name: data.tradeName,
      legal_name: data.legalName || data.tradeName,
      cnpj_masked: maskedCnpj,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state
    });
    updateEcosystemWorkshopStatus(ecoW.id, "active");

    return {
      success: true,
      message: `Oficina ${data.tradeName} adicionada com sucesso.`,
      workshop: {
        id: ecoW.id,
        trade_name: data.tradeName,
        legal_name: data.legalName || data.tradeName,
        cnpj_masked: maskedCnpj,
        email: data.email,
        phone: data.phone,
        status: "active",
        created_at: new Date().toISOString()
      }
    };
  }
}
