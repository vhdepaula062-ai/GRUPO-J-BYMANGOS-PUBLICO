import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "E-mail obrigatório", status: 422, detail: "Informe o e-mail cadastrado." });
  const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL;
  const { error } = await getPublicDatabase().auth.resetPasswordForEmail(String(email).trim().toLowerCase(), redirectTo ? { redirectTo } : undefined);
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/recovery-failed", title: "Recuperação indisponível", status: 503, detail: error.message });
  return createSuccessResponse({ message: "Se a conta existir, as instruções serão enviadas." });
}
