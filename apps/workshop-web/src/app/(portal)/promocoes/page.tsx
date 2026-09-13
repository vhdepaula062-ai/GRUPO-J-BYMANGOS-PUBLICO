import React from "react";
import { getMyWorkshop, getWorkshopPromotions } from "@/lib/queries";
import { PromocoesClient } from "./PromocoesClient";

export const dynamic = "force-dynamic";

export default async function PromocoesOficinaPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

  const promotions = workshopId ? await getWorkshopPromotions(workshopId) : [];

  return <PromocoesClient promotions={promotions} />;
}
