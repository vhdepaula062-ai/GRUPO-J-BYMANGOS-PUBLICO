import { NextRequest } from "next/server";
import { getPublicDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";
import { checkRateLimit } from "@/lib/rate-limiter";
import { z } from "@grupo-j/validation";

const verifySchema = z.object({
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  code: z.string().trim().min(4).max(128)
}).strict();

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, { maxRequests: 5, windowMs: 60000, keyPrefix: "verify-email" });
  if (limited) return limited;
  const parsed = verifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Código inválido", status: 422, detail: "Informe o e-mail e o código recebido." });
  const { data, error } = await getPublicDatabase().auth.verifyOtp({ email: parsed.data.email, token: parsed.data.code, type: "email" });
  if (error || !data.session) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-code", title: "Código inválido ou expirado", status: 422, detail: "Solicite um novo código e tente novamente." });
  return createSuccessResponse({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at });
}
