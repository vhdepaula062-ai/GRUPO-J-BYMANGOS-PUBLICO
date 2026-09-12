import React from "react";
import { Card, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function EquipeOficinaPage() {
  const team = [
    { name: "Marcos Vinicius", email: "marcos@autocenterbarra.com.br", role: "workshop_owner", status: "Ativo" },
    { name: "Rodrigo Mecânico", email: "rodrigo@autocenterbarra.com.br", role: "workshop_attendant", status: "Ativo" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe da Oficina</h1>
          <p className="text-sm text-slate-500 mt-1">Gerenciamento de mecânicos e atendentes autorizados a validar vouchers.</p>
        </div>
        <Button variant="primary" size="sm">+ Adicionar Funcionário</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Papel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {team.map((m) => (
                <tr key={m.email} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {m.name}
                    <span className="block text-xs text-slate-400">{m.email}</span>
                  </td>
                  <td className="px-6 py-4"><Badge variant="info">{m.role}</Badge></td>
                  <td className="px-6 py-4"><Badge variant="success">{m.status}</Badge></td>
                  <td className="px-6 py-4 text-right"><Button size="sm" variant="outline">Editar</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
