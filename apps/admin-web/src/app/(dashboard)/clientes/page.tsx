import React, { Suspense } from "react";
import { getMotoristas } from "@/lib/queries";
import { ClientesClient } from "./ClientesClient";

export const dynamic = "force-dynamic";

export default async function ClientesAdminPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const search = searchParams?.q ?? "";
  const motoristas = await getMotoristas(search);

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Carregando motoristas...</div>}>
      <ClientesClient initialMotoristas={motoristas} search={search} />
    </Suspense>
  );
}
