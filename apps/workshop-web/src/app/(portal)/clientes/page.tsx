import React from "react";
import { Badge, Button, Users, Phone } from "@grupo-j/ui-web";
import { getMyWorkshop, getWorkshopCustomers } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesOficinaPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

  const customers = workshopId ? await getWorkshopCustomers(workshopId) : [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Motoristas Credenciados</h1>
          <p className="text-sm text-slate-500 mt-1">
            Motoristas do Grupo J associados à sua região e vinculados à sua oficina mecânica.
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-[#034EFE]">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum motorista vinculado no momento</h3>
            <p className="text-xs text-slate-500 mt-1">
              À medida que motoristas da sua região contratarem o plano de prevenção ou comparecerem à sua oficina para realizar manutenções, eles aparecerão aqui com os veículos cadastrados.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/check-in">
              <Button variant="primary" size="sm" className="bg-[#034EFE]">
                Validar Voucher de Atendimento
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Motorista</th>
                  <th className="px-6 py-3">Contato</th>
                  <th className="px-6 py-3">Veículo / Placa</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Vinculado Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {c.full_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {c.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900">{c.plate}</span>
                      <span className="text-xs text-slate-500 block">{c.vehicle_model}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Vinculado à oficina</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
