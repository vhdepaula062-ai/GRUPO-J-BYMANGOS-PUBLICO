import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();
  if (!email || !code) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Código incompleto", status: 422, detail: "Informe o e-mail e o código recebido." });
  const { data, error } = await getPublicDatabase().auth.verifyOtp({ email: String(email).trim().toLowerCase(), token: String(code).trim(), type: "email" });
  if (error || !data.session) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-code", title: "Código inválido ou expirado", status: 422, detail: "Solicite um novo código e tente novamente." });
  return createSuccessResponse({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at });
}
