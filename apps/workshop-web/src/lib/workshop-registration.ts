import { CpfSecurity } from "@grupo-j/security";
import { maskCompanyDocument } from "@grupo-j/domain";
import "server-only";
import { createHmac } from "crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { z } from "@grupo-j/validation";
import { createServerAdminClient,createRequestClient } from "@grupo-j/database";

export type WorkshopRegistration = { responsibleName: string; tradeName: string; legalName?: string; cnpj: string; phone: string; email: string; city?: string; state?: string; password?: string };
const registrationSchema = z.object({
  responsibleName: z.string().trim().min(3).max(120),
  tradeName: z.string().trim().min(2).max(160),
  legalName: z.string().trim().max(160).optional(),
  cnpj: z.string().max(18).refine(value => value.replace(/\D/g, "").length === 14),
  phone: z.string().trim().min(10).max(25),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(2).optional(),
  password: z.string().min(10).max(128).optional()
}).strict();

export class WorkshopRegistrationInputError extends Error {}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Banco de dados não configurado para credenciamento");
  return createServerAdminClient(url, key);
}

export async function persistWorkshopRegistration(input: WorkshopRegistration) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) throw new WorkshopRegistrationInputError("Confira os dados do credenciamento. A senha deve ter de 10 a 128 caracteres.");
  input = parsed.data;
  const cleanCnpj = input.cnpj.replace(/\D/g, "");
  const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
  CpfSecurity.assertProtectionKeys(process.env.CPF_ENCRYPTION_KEY,pepper);
  if (!pepper) throw new Error("Chave de proteção de documentos não configurada");
  const db = adminClient();
  const email = input.email;
  const blindIndex = createHmac("sha256", pepper).update(`cnpj:${cleanCnpj}`).digest("hex");
  // Vercel supplies the client IP in x-forwarded-for. Also limit by document so
  // changing networks cannot repeatedly submit the same proposal.
  const forwarded = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = forwarded && isIP(forwarded) ? forwarded : "unknown";
  for (const [scope, value, max, windowSeconds] of [
    ["ip", clientIp, 5, 900],
    ["document", blindIndex, 3, 86400]
  ] as const) {
    const key = createHmac("sha256", pepper).update(`workshop-registration:${scope}:${value}`).digest("hex");
    const { data, error } = await db.rpc("consume_request_limit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
    if (error || typeof data?.allowed !== "boolean") throw new Error("Limite de cadastro indisponível");
    if (!data.allowed) throw new WorkshopRegistrationInputError("Aguarde antes de enviar outra solicitação.");
  }
  const maskedCnpj = maskCompanyDocument(cleanCnpj);
  const { data: existing, error: lookupError } = await db.from("organizations").select("id").or(`cnpj_blind_index.eq.${blindIndex},email.eq.${email}`).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) throw new Error("Cadastro existente");

  let userId: string | undefined;
  let organizationId: string | undefined;
  try {
    if (input.password) {
      const { data, error } = await db.auth.admin.createUser({ email, password: input.password, email_confirm: false, user_metadata: { full_name: input.responsibleName.trim(), phone: input.phone.trim(), account_type: "workshop" } });
      if (error || !data.user) throw error ?? new Error("Usuário da oficina não criado");
      userId = data.user.id;
    }
    const { data: org, error: orgError } = await db.from("organizations").insert({ legal_name: input.legalName?.trim() || input.tradeName.trim(), trade_name: input.tradeName.trim(), cnpj_masked: maskedCnpj, cnpj_encrypted: CpfSecurity.encrypt(cleanCnpj, process.env.CPF_ENCRYPTION_KEY ?? ""), cnpj_blind_index: blindIndex, status: "pending_approval", email, phone: input.phone.trim() }).select("id, trade_name, cnpj_masked, status, email, phone").single();
    if (orgError || !org) throw orgError ?? new Error("Organização não criada");
    organizationId = org.id;
    const { error: unitError } = await db.from("organization_units").insert({ organization_id: org.id, name: `${input.tradeName.trim()} — Matriz`, is_headquarters: true, address_street: "A informar", address_number: "S/N", address_neighborhood: "A informar", address_city: input.city?.trim() || "A informar", address_state: input.state?.trim().toUpperCase() || "SP", address_zip_code: "00000-000" });
    if (unitError) throw unitError;
    if (userId) {
      const { error: memberError } = await db.from("organization_members").insert({ organization_id: org.id, user_id: userId, role: "owner", is_active: true });
      if (memberError) throw memberError;
    }
    if(userId){
      const delivery=await createRequestClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).auth.resend({type:"signup",email,options:{emailRedirectTo:"https://grupo-j-oficinas.vercel.app/api/auth/callback?next=/painel"}});
      if(delivery.error)console.warn("Confirmação de cadastro não enviada; usuário pode solicitar reenvio.");
    }
    return { ...org, responsible_name: input.responsibleName.trim() };
  } catch (error) {
    if (organizationId) await db.from("organizations").delete().eq("id", organizationId);
    if (userId) await db.auth.admin.deleteUser(userId);
    throw error;
  }
}
