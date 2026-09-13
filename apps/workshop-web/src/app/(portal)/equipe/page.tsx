import React from "react";
import { Badge, Users, ShieldCheck } from "@grupo-j/ui-web";
import { getMyWorkshop, getWorkshopTeam } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EquipeOficinaPage() {
  const workshopData = await getMyWorkshop();
  const workshopId = (workshopData?.organization as { id?: string } | undefined)?.id;

  const team = workshopId ? await getWorkshopTeam(workshopId) : [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe & Colaboradores da Oficina</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de mecânicos, alinhadores e atendentes autorizados a validar vouchers de motoristas.
          </p>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Apenas a conta principal está cadastrada</h3>
            <p className="text-xs text-slate-500 mt-1">
              À medida que você cadastrar novos operadores e mecânicos vinculados ao CNPJ desta oficina na tabela org_members, os acessos aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Colaborador</th>
                  <th className="px-6 py-3">E-mail</th>
                  <th className="px-6 py-3">Função / Cargo</th>
                  <th className="px-6 py-3">Permissão</th>
                  <th className="px-6 py-3">Membro Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {member.full_name?.charAt(0) || "C"}
                      </div>
                      <span>{member.full_name || "Colaborador"}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{member.role === "owner" ? "Proprietário" : "Operador de Box"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        <ShieldCheck size={12} /> Validação de Vouchers
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(member.created_at)}
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
