import React from "react";
import { Badge, ShieldCheck, KeyRound } from "@grupo-j/ui-web";
import { getAdminUsers } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsuariosAdminPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe & Controle de Acessos (RBAC)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de credenciais administrativas, níveis de permissão e autenticação de dois fatores.
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum administrador cadastrado no banco</h3>
            <p className="text-xs text-slate-500 mt-1">
              Para provisionar o primeiro super-administrador do sistema (Joaquim), execute o script de provisionamento administrativo (`node scripts/create-first-admin.mjs`) informando as credenciais seguras.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Administrador</th>
                  <th className="px-6 py-3">E-mail Corporativo</th>
                  <th className="px-6 py-3">Papel / Nível</th>
                  <th className="px-6 py-3">MFA / Segurança</th>
                  <th className="px-6 py-3">Data de Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const roleName = user.role_name || (user.role_code === "admin" ? "Super Administrador" : "Operador");
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.full_name?.charAt(0) || "U"}
                        </div>
                        <span>{user.full_name || "Administrador"}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{roleName}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                          <KeyRound size={12} /> Supabase Auth JWT
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(user.created_at)}
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
