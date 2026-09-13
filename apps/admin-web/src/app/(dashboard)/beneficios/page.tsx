import React from "react";
import { getBenefitDefinitions } from "@/lib/queries";
import { BeneficiosManager } from "./BeneficiosManager";

export const dynamic = "force-dynamic";

export default async function BeneficiosPage() {
  const benefits = await getBenefitDefinitions();

  return <BeneficiosManager benefits={benefits} />;
}
