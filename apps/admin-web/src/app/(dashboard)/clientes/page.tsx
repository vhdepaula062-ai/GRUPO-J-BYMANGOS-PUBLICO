import React from "react";
import { Card, CardContent, Badge, Button } from "@grupo-j/ui-web";
import { mockCustomer, mockVehicle } from "@grupo-j/test-utils";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Motoristas Cadastrados</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de clientes finais, veículos vinculados e status de assinaturas.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">CPF (Mascarado)</th>
                  <th className="px-6 py-4">Veículo Principal</th>
                  <th className="px-6 py-4">Status da Assinatura</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {mockCustomer.fullName}
                    <span className="block text-xs text-slate-400">{mockCustomer.email}</span>
                  </td>
                  <td className="px-6 py-4 font-mono">{mockCustomer.cpfMasked}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{mockVehicle.plate}</span> — {mockVehicle.brand} {mockVehicle.model}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">Ativa (R$ 50/mês)</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline">Detalhes</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
