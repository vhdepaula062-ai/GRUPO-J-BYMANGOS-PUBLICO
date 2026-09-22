import { redirect } from "next/navigation";
import { WorkshopShell } from "@/components/WorkshopShell";
import { getMyWorkshop } from "@/lib/queries";
import { FinancialRefresh } from "@/components/FinancialRefresh";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const workshopData = await getMyWorkshop();
  if (!workshopData) {
    redirect("/login?error=no_workshop");
  }
  const org = workshopData?.organization as
    | { trade_name?: string; legal_name?: string; city?: string; state?: string }
    | undefined;

  const workshopName = org?.trade_name || "Oficina Parceira";
  const status = workshopData.organization.status;
  const workshopSubtitle = status === "active" ? "Oficina credenciada" : status === "suspended" ? "Credenciamento suspenso" : status === "pending_approval" ? "Aguardando aprovação" : "Credenciamento inativo";
  const locationName = org?.city ? `${org.city} / ${org.state || "Brasil"}` : "Rede Credenciada Grupo J";

  return (
    <WorkshopShell
      workshopName={workshopName}
      workshopSubtitle={workshopSubtitle}
      locationName={locationName}
    >
      <FinancialRefresh />{children}
    </WorkshopShell>
  );
}
