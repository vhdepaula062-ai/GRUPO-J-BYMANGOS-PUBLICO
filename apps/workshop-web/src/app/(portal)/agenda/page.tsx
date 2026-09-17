import { AgendaClient } from "./AgendaClient";
import { getMyWorkshop, getWorkshopAppointments } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AgendaOficinaPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id || "default";
  const initialAppointments = await getWorkshopAppointments(workshopId);

  return <AgendaClient initialAppointments={initialAppointments} workshopId={workshopId} />;
}
