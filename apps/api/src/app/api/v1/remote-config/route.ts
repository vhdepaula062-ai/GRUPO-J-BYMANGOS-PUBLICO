import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const activeConfig = {
    version: 1,
    environment: process.env.NODE_ENV || "development",
    features: {
      enableNewCheckinFlow: true,
      enableOilFilterBenefit: false, // Em aberto conforme DECISIONS_PENDING
      allowWorkshopChangeDays: 30 // Regra dos 30 dias
    },
    pricing: {
      driverPlanMonthlyCents: 5000,
      workshopPlanMonthlyCents: 50000,
      currency: "BRL"
    },
    supportContact: {
      phone: "0800 000 0000",
      whatsapp: "5511999998888",
      email: "suporte@grupoj.com.br"
    }
  };

  return createSuccessResponse(activeConfig, 200);
}
