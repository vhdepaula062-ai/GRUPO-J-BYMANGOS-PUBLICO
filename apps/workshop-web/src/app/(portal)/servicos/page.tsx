import React from "react";
import { Badge, Button, Wrench, Zap } from "@grupo-j/ui-web";
import { getMyWorkshop, getWorkshopServices } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoricoServicosPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

  const services = workshopId ? await getWorkshopServices(workshopId) : [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Histórico de Atendimentos & Repasses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de todos os serviços preventivos executados na sua oficina com comprovante e liquidação financeira.
          </p>
        </div>
        <Link href="/check-in">
          <Button variant="primary" size="md" className="bg-[#034EFE] font-bold">
            <Zap className="w-4 h-4 mr-1 inline" /> Novo Atendimento
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-[#034EFE]">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum atendimento realizado ainda</h3>
            <p className="text-xs text-slate-500 mt-1">
              Assim que um motorista associado validar um voucher preventivo na sua oficina, o registro completo aparecerá aqui com os dados do veículo e o comprovante de repasse.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/check-in">
              <Button variant="primary" size="sm" className="bg-[#034EFE]">
                Realizar Primeiro Atendimento
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
                  <th className="px-6 py-3">Voucher / Data</th>
                  <th className="px-6 py-3">Veículo / Placa</th>
                  <th className="px-6 py-3">Motorista</th>
                  <th className="px-6 py-3">Serviço Executado</th>
                  <th className="px-6 py-3">Repasse</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-[#034EFE] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        {item.voucher_token || item.id.slice(0, 8)}
                      </span>
                      <span className="block text-xs text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.vehicle ? (
                        <>
                          <span className="font-mono font-bold text-slate-900">{item.vehicle.plate}</span>
                          <span className="text-xs text-slate-500 block">
                            {item.vehicle.brand} {item.vehicle.model}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.customer?.profile?.full_name ?? "Motorista Assinante"}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-800">
                      {item.benefit?.name ?? "Serviço Preventivo"}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      R$ 50,00
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Concluído</Badge>
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
