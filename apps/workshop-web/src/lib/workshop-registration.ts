import "server-only";
import { createHmac } from "crypto";
import { createServerAdminClient } from "@grupo-j/database";

export type WorkshopRegistration = { responsibleName: string; tradeName: string; legalName?: string; cnpj: string; phone: string; email: string; city?: string; state?: string; password?: string };

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Banco de dados não configurado para credenciamento");
  return createServerAdminClient(url, key);
}

export async function persistWorkshopRegistration(input: WorkshopRegistration) {
  const cleanCnpj = input.cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) throw new Error("CNPJ inválido");
  if (input.password && input.password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres");
  const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
  if (!pepper) throw new Error("Chave de proteção de documentos não configurada");
  const db = adminClient();
  const email = input.email.trim().toLowerCase();
  const blindIndex = createHmac("sha256", pepper).update(`cnpj:${cleanCnpj}`).digest("hex");
  const maskedCnpj = cleanCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  const { data: existing } = await db.from("organizations").select("id").or(`cnpj_blind_index.eq.${blindIndex},email.eq.${email}`).maybeSingle();
  if (existing) throw new Error("Este CNPJ ou e-mail já possui uma proposta cadastrada");

  let userId: string | undefined;
  let organizationId: string | undefined;
  try {
    if (input.password) {
      const { data, error } = await db.auth.admin.createUser({ email, password: input.password, email_confirm: false, user_metadata: { full_name: input.responsibleName.trim(), phone: input.phone.trim(), account_type: "workshop" } });
      if (error || !data.user) throw error ?? new Error("Usuário da oficina não criado");
      userId = data.user.id;
    }
    const { data: org, error: orgError } = await db.from("organizations").insert({ legal_name: input.legalName?.trim() || input.tradeName.trim(), trade_name: input.tradeName.trim(), cnpj_masked: maskedCnpj, cnpj_blind_index: blindIndex, status: "pending_approval", email, phone: input.phone.trim() }).select("id, trade_name, cnpj_masked, status, email, phone").single();
    if (orgError || !org) throw orgError ?? new Error("Organização não criada");
    organizationId = org.id;
    const { error: unitError } = await db.from("organization_units").insert({ organization_id: org.id, name: `${input.tradeName.trim()} — Matriz`, is_headquarters: true, address_street: "A informar", address_number: "S/N", address_neighborhood: "A informar", address_city: input.city?.trim() || "A informar", address_state: input.state?.trim().toUpperCase() || "SP", address_zip_code: "00000-000" });
    if (unitError) throw unitError;
    if (userId) {
      const { error: memberError } = await db.from("organization_members").insert({ organization_id: org.id, user_id: userId, role: "owner", is_active: true });
      if (memberError) throw memberError;
    }
    return { ...org, responsible_name: input.responsibleName.trim() };
  } catch (error) {
    if (organizationId) await db.from("organizations").delete().eq("id", organizationId);
    if (userId) await db.auth.admin.deleteUser(userId);
    throw error;
  }
}
