import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/lib/response";
import { mockDriverPlan, mockWorkshopPlan } from "@grupo-j/test-utils";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  // Retorna os planos versionados ativos configurados em centavos (5000 e 50000)
  const plans = [mockDriverPlan, mockWorkshopPlan];

  return createSuccessResponse(plans, 200);
}
