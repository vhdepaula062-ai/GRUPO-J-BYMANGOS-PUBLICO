import { NextRequest } from "next/server";
import { authenticateRequest, getAdminDatabase, isAuthFailure } from "@/lib/auth";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const { error } = await getAdminDatabase().auth.admin.signOut(auth.accessToken, "local");
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/logout-failed", title: "Não foi possível encerrar a sessão", status: 503, detail: error.message });
  return createSuccessResponse({ message: "Sessão encerrada com sucesso." });
}
