import React from "react";
import { Lock } from "@grupo-j/ui-web";
import { getAuditLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AuditoriaAdminPage() {
  const auditLogs = await getAuditLogs();

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trilhas de Auditoria Imutáveis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Logs criptográficos e rastreabilidade de todas as ações administrativas, financeiras e LGPD.
          </p>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum evento de auditoria registrado</h3>
            <p className="text-xs text-slate-500 mt-1">
              Todas as mutações críticas no banco de dados (aprovações de ofertas, acessos a dados sensíveis, conciliações financeiras) são gravadas com hash append-only nesta trilha.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Ator (ID)</th>
                  <th className="px-6 py-3">Ação</th>
                  <th className="px-6 py-3">Tipo de Recurso</th>
                  <th className="px-6 py-3">ID do Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : "Sistema"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {log.resource_type || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {log.resource_id ? `${log.resource_id.slice(0, 8)}...` : "—"}
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
