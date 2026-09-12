import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { assignWorkshopSchema } from "@grupo-j/validation";
import { WorkshopChangePolicy, WorkshopChangeCooldownError } from "@grupo-j/domain";
import { mockCustomer } from "@grupo-j/test-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = assignWorkshopSchema.safeParse(body);

    if (!validation.success) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/validation-error",
        title: "Dados de requisição inválidos",
        status: 422,
        detail: validation.error.errors[0]?.message || "Falha de validação",
        errors: { form: validation.error.errors.map((e) => e.message) }
      });
    }

    const { workshopId } = validation.data;

    // Obter estado atual de vinculação do motorista
    const currentCustomerState = {
      assignedWorkshopId: mockCustomer.assignedWorkshopId,
      assignedAt: mockCustomer.workshopAssignedAt,
      nextChangeAllowedAt: mockCustomer.nextWorkshopChangeAllowedAt
    };

    // Validação estrita da regra inegociável de 30 dias
    try {
      WorkshopChangePolicy.assertCanChangeWorkshop(currentCustomerState, new Date());
    } catch (err) {
      if (err instanceof WorkshopChangeCooldownError) {
        return createProblemResponse({
          type: "https://api.grupoj.com.br/v1/errors/workshop-change-cooldown",
          title: "Troca de Oficina Bloqueada por Carência",
          status: 422,
          code: err.code,
          detail: err.message,
          nextChangeAllowedAt: err.nextChangeAllowedAt
        });
      }
      throw err;
    }

    // Se liberado, calcula a nova data (+30 dias)
    const assignedAt = new Date();
    const nextAllowed = WorkshopChangePolicy.calculateNextAllowedDate(assignedAt);

    return createSuccessResponse(
      {
        message: "Oficina parceira vinculada com sucesso!",
        assignedWorkshopId: workshopId,
        assignedAt: assignedAt.toISOString(),
        nextChangeAllowedAt: nextAllowed.toISOString()
      },
      200
    );
  } catch (error) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/internal-error",
      title: "Erro interno ao processar vinculação",
      status: 500,
      detail: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}
