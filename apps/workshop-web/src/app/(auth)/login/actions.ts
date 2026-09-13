"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { registerPendingWorkshopProposal } from "@grupo-j/database";
import { revalidatePath } from "next/cache";

export interface RegisterWorkshopPartnerParams {
  tradeName: string;
  cnpj: string;
  contactName: string;
  phone: string;
  email: string;
  password?: string;
  city?: string;
  state?: string;
}

export interface RegisterWorkshopPartnerResult {
  success: boolean;
  message: string;
  workshop?: {
    id: string;
    trade_name: string;
    cnpj_masked: string;
    status: string;
    email: string;
    phone: string;
    responsible_name?: string;
  };
}

/**
 * Server Action que processa o cadastro inicial de auto centers parceiros.
 * Regra do Grupo J: Todo novo cadastro nasce como "pending_approval" (Aguardando Aprovação),
 * sendo encaminhado para a mesa de moderação do Joaquim no Painel Administrativo.
 */
export async function registerWorkshopPartnerAction(
  params: RegisterWorkshopPartnerParams
): Promise<RegisterWorkshopPartnerResult> {
  const cleanCnpj = params.cnpj.replace(/\D/g, "");
  const maskedCnpj =
    cleanCnpj.length === 14
      ? cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
      : params.cnpj.trim();

  const blindIndex = `blind_${cleanCnpj || Math.random().toString(36).substring(2, 14)}`;
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanTradeName = params.tradeName.trim();
  const cleanContact = params.contactName.trim();
  const cleanPhone = params.phone.trim();
  const city = params.city?.trim() || "São Paulo";
  const state = params.state?.trim().toUpperCase() || "SP";

  // 1. Persistência no Store Compartilhado do Ecossistema
  // Garante que o Admin enxergue a proposta imediatamente em tempo real
  const ecoWorkshop = registerPendingWorkshopProposal({
    trade_name: cleanTradeName,
    legal_name: cleanTradeName,
    cnpj_masked: maskedCnpj,
    email: cleanEmail,
    phone: cleanPhone,
    responsible_name: cleanContact,
    city,
    state
  });

  // 2. Persistência no Supabase (se configurado/ativo)
  const supabase = createServerSupabaseClient();
  let createdOrgId = ecoWorkshop.id;

  try {
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        legal_name: cleanTradeName,
        trade_name: cleanTradeName,
        cnpj_masked: maskedCnpj,
        cnpj_blind_index: blindIndex,
        status: "pending_approval", // Sempre pendente de aprovação
        email: cleanEmail,
        phone: cleanPhone
      })
      .select("id")
      .single();

    if (!orgError && org?.id) {
      createdOrgId = org.id;

      // Cria a unidade matriz
      await supabase.from("organization_units").insert({
        organization_id: org.id,
        name: `${cleanTradeName} — Matriz`,
        is_headquarters: true,
        address_street: "Avenida Principal",
        address_number: "100",
        address_neighborhood: "Centro",
        address_city: city,
        address_state: state,
        address_postal_code: "00000-000",
        phone: cleanPhone
      });
    }

    // Cria o usuário de autenticação caso a senha tenha sido enviada
    if (params.password) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            trade_name: cleanTradeName,
            cnpj: maskedCnpj,
            contact_name: cleanContact,
            phone: cleanPhone,
            role: "workshop_admin",
            organization_id: createdOrgId,
            status: "pending_approval"
          }
        }
      });
    }
  } catch (err) {
    console.warn("[registerWorkshopPartnerAction] Supabase sync note (usando store do ecossistema):", err);
  }

  // 3. Revalidação instantânea de rotas em todo o ecossistema
  try {
    revalidatePath("/oficinas");
    revalidatePath("/dashboard");
    revalidatePath("/painel");
    revalidatePath("/", "layout");
  } catch {
    // Ignorado em execução estática
  }

  return {
    success: true,
    message: "Proposta de credenciamento enviada com sucesso! Encaminhada para a fila de aprovação no Painel Admin.",
    workshop: {
      id: createdOrgId,
      trade_name: cleanTradeName,
      cnpj_masked: maskedCnpj,
      status: "pending_approval",
      email: cleanEmail,
      phone: cleanPhone,
      responsible_name: cleanContact
    }
  };
}
