import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";
import { isSafeHttpUrl } from "@grupo-j/validation";
import { defaultLogger } from "@grupo-j/observability";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, {
    maxRequests: 5,
    windowMs: 60000,
    keyPrefix: "recover"
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/validation-error",
        title: "E-mail obrigatório",
        status: 422,
        detail: "Informe um endereço de e-mail válido."
      });
    }

    let redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL;
    if (redirectTo && !isSafeHttpUrl(redirectTo)) {
      redirectTo = undefined;
    }

    // Executa a recuperação via Supabase Auth
    const { error } = await getPublicDatabase().auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
    );

    if (error) {
      // Registra no log interno sem vazar para o cliente se o e-mail existe ou não
      defaultLogger.warn("Falha na solicitação de recuperação de senha", {
        reason: error.message
      });
    }

    // Resposta genérica constante contra enumeração de usuários (timing / status)
    return createSuccessResponse(
      {
        message: "Se o e-mail informado estiver registrado em nossa base, as instruções de recuperação serão enviadas em instantes."
      },
      200
    );
  } catch (err: unknown) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/internal-error",
      title: "Erro no serviço de recuperação",
      status: 500,
      detail: "Ocorreu um erro ao processar sua solicitação."
    });
  }
}
