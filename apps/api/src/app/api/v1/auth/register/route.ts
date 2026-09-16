import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { getAdminDatabase, getPublicDatabase } from "@/lib/auth";
import { CpfSecurity } from "@grupo-j/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let createdUserId: string | undefined;
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const cpf = CpfSecurity.normalize(String(body.cpf ?? ""));
    if (!fullName || !email || !phone || !password || cpf.length !== 11) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Cadastro incompleto", status: 422, detail: "Nome, e-mail, CPF válido, celular e senha são obrigatórios." });
    }
    if (password.length < 8) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/weak-password", title: "Senha muito curta", status: 422, detail: "Use pelo menos 8 caracteres." });
    }
    if (body.termsAccepted !== true || body.privacyAccepted !== true) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/terms-required", title: "Consentimento obrigatório", status: 422, detail: "Aceite os Termos de Uso e a Política de Privacidade para continuar." });
    }

    const encryptionKey = process.env.CPF_ENCRYPTION_KEY;
    const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
    if (!encryptionKey || !pepper) throw new Error("Chaves de proteção de CPF não configuradas");
    const admin = getAdminDatabase();
    const blindIndex = CpfSecurity.computeBlindIndex(cpf, pepper);
    const { data: existing } = await admin.from("profiles").select("id").eq("cpf_blind_index", blindIndex).maybeSingle();
    if (existing) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/account-exists", title: "Conta já cadastrada", status: 409, detail: "Já existe uma conta para este CPF." });
    }

    const { data: signup, error: signupError } = await getPublicDatabase().auth.signUp({
      email, password, options: { data: { full_name: fullName, phone, account_type: "customer" } }
    });
    if (signupError || !signup.user) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/registration-failed", title: "Não foi possível criar a conta", status: signupError?.status === 422 ? 422 : 409, detail: signupError?.message ?? "Cadastro não concluído." });
    }
    createdUserId = signup.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: signup.user.id, full_name: fullName, email, phone,
      cpf_masked: CpfSecurity.mask(cpf), cpf_encrypted: CpfSecurity.encrypt(cpf, encryptionKey),
      cpf_blind_index: blindIndex, updated_at: new Date().toISOString()
    });
    if (profileError) throw profileError;
    const { data: customer, error: customerError } = await admin.from("customers").upsert({ profile_id: signup.user.id }, { onConflict: "profile_id" }).select("id").single();
    if (customerError) throw customerError;
    const now = new Date().toISOString();
    const { error: consentError } = await admin.from("consent_records").insert([
      { user_id: signup.user.id, document_type: "terms_of_use", document_version: String(body.termsVersion ?? "1.0"), accepted: true, accepted_at: now },
      { user_id: signup.user.id, document_type: "privacy_policy", document_version: String(body.privacyVersion ?? "1.0"), accepted: true, accepted_at: now }
    ]);
    if (consentError) throw consentError;
    return createSuccessResponse({
      customer: { id: customer.id, fullName, email, phone, cpfMasked: CpfSecurity.mask(cpf) },
      accessToken: signup.session?.access_token ?? null,
      refreshToken: signup.session?.refresh_token ?? null,
      emailConfirmationRequired: !signup.session,
      subscriptionStatus: "pending_payment"
    }, 201);
  } catch (error) {
    if (createdUserId) await getAdminDatabase().auth.admin.deleteUser(createdUserId).catch(() => undefined);
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/registration-failed", title: "Cadastro não concluído", status: 500, detail: error instanceof Error ? error.message : "Erro interno" });
  }
}
