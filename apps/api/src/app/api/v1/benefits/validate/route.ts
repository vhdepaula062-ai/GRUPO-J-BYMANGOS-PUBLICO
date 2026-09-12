import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { BenefitRedemptionValidator, DomainError } from "@grupo-j/domain";
import { Entitlement, BenefitDefinition } from "@grupo-j/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucherToken, workshopId, vehiclePlate } = body;

    if (!voucherToken || !workshopId || !vehiclePlate) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/missing-parameters",
        title: "Parâmetros obrigatórios ausentes",
        status: 400,
        detail: "Voucher token, oficina e placa do veículo são obrigatórios para validação."
      });
    }

    const mockEntitlement: Entitlement = {
      id: "ent-123",
      customerId: "cust-123",
      benefitDefinitionId: "ben-123",
      cycleStart: "2026-01-01T00:00:00Z",
      cycleEnd: "2026-06-30T23:59:59Z",
      totalQuantity: 2,
      usedQuantity: 0,
      availableQuantity: 2
    };

    const mockBenefit: BenefitDefinition = {
      id: "ben-123",
      name: "Alinhamento 3D e Balanceamento",
      slug: "alinhamento-balanceamento",
      description: "Alinhamento e balanceamento preventivo",
      periodicity: "semiannual",
      quantityPerCycle: 2,
      gracePeriodDays: 0,
      isIncludedInBasePlan: true,
      isActive: true
    };

    // Executa validação pelo motor de domínio
    BenefitRedemptionValidator.validate({
      subscriptionStatus: "active",
      subscriptionStartedAt: "2026-01-01T00:00:00Z",
      entitlement: mockEntitlement,
      benefitDefinition: mockBenefit,
      assignedWorkshopId: workshopId,
      redemptionWorkshopId: workshopId
    });

    return createSuccessResponse({
      valid: true,
      benefit: mockBenefit.name,
      availableQuantityAfter: mockEntitlement.availableQuantity - 1,
      vehiclePlate,
      authorizedAt: new Date().toISOString()
    });
  } catch (err) {
    if (err instanceof DomainError) {
      return createProblemResponse({
        type: `https://api.grupoj.com.br/v1/errors/${err.code.toLowerCase()}`,
        title: "Validação de Benefício Recusada",
        status: err.statusCode,
        code: err.code,
        detail: err.message
      });
    }

    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/internal",
      title: "Erro interno",
      status: 500,
      detail: err instanceof Error ? err.message : "Erro desconhecido"
    });
  }
}
