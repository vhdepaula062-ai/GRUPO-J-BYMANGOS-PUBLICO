import React from "react";
import { Card, CardContent, Badge } from "@grupo-j/ui-web";
import { mockCustomer, mockVehicle } from "@grupo-j/test-utils";

export default function ClientesOficinaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clientes Vinculados à Oficina</h1>
        <p className="text-sm text-slate-500 mt-1">
          Motoristas ativos que escolheram este centro automotivo como referência (isolado via RLS).
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nome do Motorista</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Status da Assinatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{mockCustomer.fullName}</td>
                <td className="px-6 py-4">{mockCustomer.phone}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {mockVehicle.plate} <span className="text-xs font-normal text-slate-500">({mockVehicle.brand} {mockVehicle.model})</span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="success">Assinante Ativo</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
