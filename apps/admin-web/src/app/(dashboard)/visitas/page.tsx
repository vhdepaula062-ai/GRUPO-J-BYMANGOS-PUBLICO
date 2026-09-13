import React from "react";
import { Badge, ShieldCheck } from "@grupo-j/ui-web";
import { getRecentCheckIns } from "@/lib/queries";
import { formatDateTime, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VisitasFeedPage() {
  const checkIns = await getRecentCheckIns();

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Visitas & Check-ins</h1>
          <p className="text-sm text-slate-500 mt-1">
            Feed operacional de validações de vouchers preventivos executados pelas oficinas parceiras.
          </p>
        </div>
      </div>

      {checkIns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum check-in registrado no momento</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quando os motoristas chegarem às oficinas credenciadas e tiverem seus vouchers validados pelo operador, o registro de atendimento será transmitido em tempo real para este feed.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Data / Hora</th>
                  <th className="px-6 py-3">Oficina Credenciada</th>
                  <th className="px-6 py-3">Veículo / Placa</th>
                  <th className="px-6 py-3">Benefício Executado</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checkIns.map((item) => {
                  const badge = statusLabel(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {item.workshop?.trade_name ?? "Oficina Parceira"}
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
                      <td className="px-6 py-4 text-xs font-medium text-slate-800">
                        {item.benefit?.name ?? "Serviço Preventivo"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
