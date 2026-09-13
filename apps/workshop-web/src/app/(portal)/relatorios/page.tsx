import React from "react";
import { getMyWorkshop, getWorkshopServices } from "@/lib/queries";
import { RelatoriosClient } from "./RelatoriosClient";

export const dynamic = "force-dynamic";

export default async function RelatoriosOficinaPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

  const services = workshopId ? await getWorkshopServices(workshopId) : [];

  return <RelatoriosClient services={services} />;
}
