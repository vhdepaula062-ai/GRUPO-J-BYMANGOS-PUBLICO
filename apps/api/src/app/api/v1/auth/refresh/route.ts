import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { getPublicDatabase } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { z } from "@grupo-j/validation";

export const dynamic = "force-dynamic";
const refreshSchema = z.object({ refreshToken: z.string().min(16).max(4096) }).strict();

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, { maxRequests: 30, windowMs: 60000, keyPrefix: "refresh-session" });
  if (limited) return limited;
  try {
    const parsed = refreshSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-token", title: "Refresh token inválido", status: 401, detail: "Faça login novamente." });
    const { data, error } = await getPublicDatabase().auth.refreshSession({ refresh_token: parsed.data.refreshToken });
    if (error || !data.session) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-token", title: "Sessão expirada", status: 401, detail: "Faça login novamente." });
    return createSuccessResponse({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at });
  } catch (error) {
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/service-unavailable", title: "Não foi possível renovar a sessão", status: 503, detail: error instanceof Error ? error.message : "Serviço indisponível" });
  }
}
