import React from "react";
import { getMyWorkshop } from "@/lib/queries";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesOficinaPage() {
  const workshopData = await getMyWorkshop();
  const org = workshopData?.organization as {
    trade_name?: string;
    legal_name?: string;
    email?: string;
    phone?: string;
  } | undefined;

  return <ConfiguracoesClient initialData={org} />;
}
