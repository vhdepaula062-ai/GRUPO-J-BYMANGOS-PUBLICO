import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function WorkshopDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel da Oficina</h1>
          <p className="text-sm text-slate-500 mt-1">Resumo operacional de atendimentos preventivos e clientes vinculados.</p>
        </div>
        <Link href="/check-in">
          <Button variant="primary" size="sm">⚡ Novo Check-in de Veículo</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-500">Clientes Vinculados</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">184</p>
            <p className="text-xs text-slate-500 mt-1">Motoristas que escolheram esta unidade</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-500">Atendimentos no Mês</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">42</p>
            <p className="text-xs text-emerald-600 mt-1">100% de benefícios validados</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-xs font-semibold uppercase text-slate-500">Mensalidade B2B</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">R$ 500,00</p>
            <div className="mt-1">
              <Badge variant="success">Em dia</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Atendimentos Registrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Placa / Veículo</th>
                  <th className="px-6 py-4">Benefício Resgatado</th>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    BRA2E19 <span className="text-xs font-normal text-slate-500">(VW Gol)</span>
                  </td>
                  <td className="px-6 py-4">Alinhamento 3D e Balanceamento</td>
                  <td className="px-6 py-4 text-xs text-slate-500">Hoje às 10:30</td>
                  <td className="px-6 py-4">
                    <Badge variant="success">Concluído</Badge>
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
