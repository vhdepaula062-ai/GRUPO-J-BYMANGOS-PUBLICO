import { CUSTOMER_EMAIL_CONFIRMATION_URL } from "@/lib/email-confirmation";
import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { getAdminDatabase, getPublicDatabase } from "@/lib/auth";
import { CpfSecurity } from "@grupo-j/security";
import { cpfSchema, z } from "@grupo-j/validation";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";
const registrationSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().max(25).refine(value => /^\d{10,15}$/.test(value.replace(/\D/g, ""))),
  password: z.string().min(8).max(128),
  cpf: cpfSchema,
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean()
}).strict();

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, { maxRequests: 5, windowMs: 60000, keyPrefix: "register" });
  if (limited) return limited;
  let createdUserId: string | undefined;
  try {
    const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Cadastro inválido", status: 422, detail: "Confira nome, e-mail, CPF, celular e senha (8 a 128 caracteres)." });
    const { fullName, email, phone, password } = parsed.data;
    const cpf = CpfSecurity.normalize(parsed.data.cpf);
    if (parsed.data.termsAccepted !== true || parsed.data.privacyAccepted !== true) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/terms-required", title: "Documentos obrigatórios", status: 422, detail: "Aceite os Termos de Uso e confirme a leitura da Política de Privacidade para continuar." });
    }

    const encryptionKey = process.env.CPF_ENCRYPTION_KEY;
    const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
    CpfSecurity.assertProtectionKeys(encryptionKey,pepper);
    if (!encryptionKey || !pepper) throw new Error("Chaves de proteção de CPF não configuradas");
    const admin = getAdminDatabase();
    const blindIndex = CpfSecurity.computeBlindIndex(cpf, pepper);
    const { data: existing, error: lookupError } = await admin.from("profiles").select("id").eq("cpf_blind_index", blindIndex).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/account-exists", title: "Conta já cadastrada", status: 409, detail: "Já existe uma conta para este CPF." });
    }

    // Only atomic creation proves that this request owns a NEW identity.
    // Public signUp can return an existing unconfirmed user's real identifier.
    const { data: signup, error: signupError } = await admin.auth.admin.createUser({
      email, password, email_confirm: false,
      user_metadata: { full_name: fullName, phone, account_type: "customer" }
    });
    if (signupError || !signup.user) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/registration-failed", title: "Não foi possível criar a conta", status: 409, detail: "Confira os dados. Se já iniciou o cadastro, entre na conta ou reenvie o e-mail de confirmação." });
    }
    createdUserId = signup.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: signup.user.id, full_name: fullName, email, phone,
      cpf_masked: CpfSecurity.mask(cpf), cpf_encrypted: CpfSecurity.encrypt(cpf, encryptionKey),
      cpf_blind_index: blindIndex, updated_at: new Date().toISOString()
    });
    if (profileError) {
      throw profileError;
    }
    // Busca a primeira oficina ativa ou a Rede Credenciada para vincular o motorista
    const { data: defaultWorkshop, error: workshopError } = await admin
      .from("organizations")
      .select("id")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (workshopError) throw workshopError;

    const assignedWorkshopId = defaultWorkshop?.id || null;

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .upsert({
        profile_id: signup.user.id,
        assigned_workshop_id: assignedWorkshopId
      }, { onConflict: "profile_id" })
      .select("id")
      .single();
    if (customerError) throw customerError;

    if (assignedWorkshopId) {
      const { error: assignmentError } = await admin.from("workshop_assignments").insert({
        customer_id: customer.id,
        workshop_id: assignedWorkshopId,
        next_change_allowed_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        is_active: true
      });
      if (assignmentError) throw assignmentError;
    }

    // Associa o papel de customer se existir
    const { data: roleRow, error: roleLookupError } = await admin
      .from("roles")
      .select("id")
      .eq("code", "customer")
      .maybeSingle();
    if (roleLookupError || !roleRow?.id) throw new Error("Customer role unavailable");

    if (roleRow?.id) {
      const { error: roleError } = await admin.from("user_roles").upsert({
        user_id: signup.user.id,
        role_id: roleRow.id
      }, { onConflict: "user_id,role_id" });
      if (roleError) throw roleError;
    }

    const now = new Date().toISOString();
    const { error: consentError } = await admin.from("consent_records").insert([
      { user_id: signup.user.id, document_type: "terms_of_use", document_version: process.env.TERMS_DOCUMENT_VERSION ?? "1.0", accepted: true, accepted_at: now },
      { user_id: signup.user.id, document_type: "privacy_policy", document_version: process.env.PRIVACY_DOCUMENT_VERSION ?? "1.0", accepted: true, accepted_at: now }
    ]);
    if (consentError) throw consentError;
    // Once provisioned, mail delivery failures must never erase the account.
    createdUserId = undefined;
    const { error: mailError } = await getPublicDatabase().auth.resend({
      type: "signup", email, options: { emailRedirectTo: CUSTOMER_EMAIL_CONFIRMATION_URL }
    }).catch(() => ({ error: { message: "Mail unavailable" } }));
    return createSuccessResponse({
      customer: { id: customer.id, fullName, email, phone, cpfMasked: CpfSecurity.mask(cpf) },
      accessToken: null,
      refreshToken: null,
      emailConfirmationRequired: true,
      confirmationEmailSent: !mailError,
      subscriptionStatus: "pending_payment"
    }, 201);
  } catch (error) {
    if (createdUserId) await getAdminDatabase().auth.admin.deleteUser(createdUserId).catch(() => undefined);
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/registration-failed", title: "Cadastro não concluído", status: 500, detail: "Não foi possível concluir agora. Tente novamente em instantes; se já iniciou o cadastro, use a recuperação de acesso." });
  }
}
