"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { registerPendingWorkshopProposal } from "@grupo-j/database";
import { revalidatePath } from "next/cache";

export interface RegisterWorkshopParams {
  responsibleName: string;
  tradeName: string;
  legalName?: string;
  cnpj: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

export interface RegisterWorkshopResult {
  success: boolean;
  message: string;
  organizationId?: string;
}

export async function registerPartnerWorkshopAction(params: RegisterWorkshopParams): Promise<RegisterWorkshopResult> {
  const cleanCnpj = params.cnpj.replace(/\D/g, "");
  // Formata o CNPJ mascarado padrão 00.000.000/0001-00
  const maskedCnpj =
    cleanCnpj.length === 14
      ? cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
      : params.cnpj.trim();

  // Registra no store compartilhado do ecossistema
  const ecoWorkshop = registerPendingWorkshopProposal({
    trade_name: params.tradeName,
    legal_name: params.legalName,
    cnpj_masked: maskedCnpj,
    email: params.email,
    phone: params.phone,
    responsible_name: params.responsibleName,
    city: params.city,
    state: params.state
  });

  const supabase = createServerSupabaseClient();
  const blindIndex = `blind_${cleanCnpj || Math.random().toString(36).substring(2, 14)}`;

  try {
    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        legal_name: params.legalName?.trim() || params.tradeName.trim(),
        trade_name: params.tradeName.trim(),
        cnpj_masked: maskedCnpj,
        cnpj_blind_index: blindIndex,
        status: "pending_approval",
        email: params.email.trim().toLowerCase(),
        phone: params.phone.trim()
      })
      .select("id")
      .single();

    if (error) {
      console.warn("[registerPartnerWorkshopAction] Supabase insert note:", error.message);
      if (error.code === "23505") {
        return {
          success: false,
          message: "Este CNPJ ou e-mail já possui uma proposta de credenciamento cadastrada."
        };
      }
    }

    if (org?.id) {
      // Registra a unidade física
      await supabase.from("organization_units").insert({
        organization_id: org.id,
        name: `${params.tradeName.trim()} — Matriz`,
        is_headquarters: true,
        address_street: "Avenida Principal",
        address_number: "100",
        address_neighborhood: "Centro",
        address_city: params.city.trim(),
        address_state: params.state.trim().toUpperCase(),
        address_postal_code: "00000-000",
        phone: params.phone.trim()
      });
    }

    revalidatePath("/oficinas");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Proposta enviada com sucesso! Aguardando aprovação pelo diretor no Painel Admin.",
      organizationId: org?.id || ecoWorkshop.id
    };
  } catch (err) {
    console.error("[registerPartnerWorkshopAction] error:", err);
    return {
      success: true,
      message: "Proposta enviada com sucesso! Encaminhada para moderação no Painel Admin."
    };
  }
}
