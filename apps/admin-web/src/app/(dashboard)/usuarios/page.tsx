import React from "react";
import { Card, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function UsuariosPage() {
  const users = [
    {
      name: "Joaquim",
      email: "joaquim@grupoj.com.br",
      role: "platform_owner",
      mfa: "Ativo"
    },
    {
      name: "Dra. Renata DPO",
      email: "privacidade@grupoj.com.br",
      role: "privacy_admin",
      mfa: "Ativo"
    },
    {
      name: "Mariana Financeiro",
      email: "financeiro@grupoj.com.br",
      role: "finance_admin",
      mfa: "Ativo"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Usuários e Permissões Administrativas</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de operadores da matriz Grupo J com MFA compulsório.</p>
        </div>
        <Button variant="primary" size="sm">+ Convidar Administrador</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Papel (RBAC)</th>
                <th className="px-6 py-4">Segundo Fator (MFA)</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.email} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {u.name}
                    <span className="block text-xs text-slate-400">{u.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">{u.mfa}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
