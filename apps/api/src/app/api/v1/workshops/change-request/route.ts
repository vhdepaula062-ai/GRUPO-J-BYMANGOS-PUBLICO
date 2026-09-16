import { NextRequest } from "next/server";
import { assignWorkshopSchema } from "@grupo-j/validation";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const validation = assignWorkshopSchema.safeParse(await request.json());
  if (!validation.success) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Oficina inválida", status: 422, detail: validation.error.errors[0]?.message ?? "Informe a oficina." });
  const { data, error } = await auth.db.rpc("request_workshop_change", { p_workshop_id: validation.data.workshopId });
  if (error) {
    const cooldown = error.message.match(/WORKSHOP_CHANGE_COOLDOWN:([^\s]+)/)?.[1];
    return createProblemResponse({ type: `https://api.grupoj.com.br/v1/errors/${cooldown ? "workshop-change-cooldown" : "workshop-change-failed"}`, title: cooldown ? "Troca bloqueada pela carência de 30 dias" : "Não foi possível trocar a oficina", status: cooldown ? 422 : 400, detail: cooldown ? `A próxima troca estará disponível em ${cooldown}.` : error.message });
  }
  return createSuccessResponse(data);
}
