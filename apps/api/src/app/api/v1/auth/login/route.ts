import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { getAdminDatabase, getPublicDatabase } from "@/lib/auth";
import { CpfSecurity } from "@grupo-j/security";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 60000,
    keyPrefix: "login"
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const identifier = String(body.identifier ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!identifier || !password) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-credentials", title: "Credenciais incompletas", status: 400, detail: "Informe seu e-mail ou CPF e a senha de acesso." });
    }

    let email = identifier;
    if (!identifier.includes("@")) {
      const pepper = process.env.CPF_BLIND_INDEX_PEPPER;
      if (!pepper) throw new Error("CPF_BLIND_INDEX_PEPPER não configurado");
      const blindIndex = CpfSecurity.computeBlindIndex(identifier, pepper);
      const { data } = await getAdminDatabase().from("profiles").select("email").eq("cpf_blind_index", blindIndex).maybeSingle();
      email = data?.email ? String(data.email) : "invalid@invalid.local";
    }

    const { data, error } = await getPublicDatabase().auth.signInWithPassword({ email, password });
    if (error?.code === "email_not_confirmed") {
      return createProblemResponse({type:"https://api.grupoj.com.br/v1/errors/email-not-confirmed",title:"Confirme seu e-mail",status:403,detail:"Abra o link enviado ao seu e-mail e depois entre com sua senha. Se necessário, solicite um novo link de confirmação."});
    }
    if (error || !data.session || !data.user) {
      return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-credentials", title: "E-mail, CPF ou senha inválidos", status: 401, detail: "Confira seus dados e tente novamente." });
    }

    const admin = getAdminDatabase();
    const [{ data: profile }, { data: roles }] = await Promise.all([
      admin.from("profiles").select("id, full_name, email, phone, cpf_masked, mfa_enabled").eq("id", data.user.id).single(),
      admin.from("user_roles").select("roles(code)").eq("user_id", data.user.id)
    ]);
    return createSuccessResponse({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        id: data.user.id,
        fullName: profile?.full_name ?? data.user.user_metadata?.full_name ?? "",
        email: data.user.email,
        phone: profile?.phone ?? null,
        cpfMasked: profile?.cpf_masked ?? null,
        mfaEnabled: profile?.mfa_enabled ?? false,
        roles: (roles ?? []).map((item: any) => item.roles?.code).filter(Boolean)
      }
    });
  } catch (error) {
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/service-unavailable", title: "Não foi possível entrar", status: 503, detail: error instanceof Error ? error.message : "Serviço indisponível" });
  }
}
