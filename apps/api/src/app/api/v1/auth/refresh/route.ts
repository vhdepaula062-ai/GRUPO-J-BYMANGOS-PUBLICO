import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { getPublicDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-token", title: "Refresh token ausente", status: 401, detail: "Faça login novamente." });
    const { data, error } = await getPublicDatabase().auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-token", title: "Sessão expirada", status: 401, detail: "Faça login novamente." });
    return createSuccessResponse({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at });
  } catch (error) {
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/service-unavailable", title: "Não foi possível renovar a sessão", status: 503, detail: error instanceof Error ? error.message : "Serviço indisponível" });
  }
}
