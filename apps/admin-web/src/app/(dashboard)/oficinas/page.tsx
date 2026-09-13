// Server Component — lista oficial de oficinas do Supabase com moderação de cadastros
import React from "react";
import { PageHeader } from "@grupo-j/ui-web";
import { getWorkshops } from "@/lib/queries";
import { OficinasModerator } from "./OficinasModerator";

export default async function OficinasAdminPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const search = searchParams?.q ?? "";
  const oficinas = await getWorkshops(search);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Oficinas Parceiras (Centros Automotivos)"
        subtitle="Gestão da rede credenciada e moderação de novos cadastros de oficinas parceiras."
      />

      <OficinasModerator initialWorkshops={oficinas} />
    </div>
  );
}
