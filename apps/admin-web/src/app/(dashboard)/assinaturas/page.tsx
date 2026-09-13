import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, CreditCard } from "@grupo-j/ui-web";
import { getSubscriptions } from "@/lib/queries";
import { formatCents, formatDate, statusLabel } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Planos & Assinaturas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de planos recorrentes e assinaturas ativas no ecossistema Grupo J.
          </p>
        </div>
      </div>

      {/* Planos Oficiais da Plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plano Prevenção Contínua</CardTitle>
              <Badge variant="info">B2C — Motorista</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-extrabold text-slate-900">R$ 50,00</span>
              <span className="text-sm text-slate-500"> / mês (recorrência)</span>
            </div>
            <p className="text-sm text-slate-600">
              Acesso aos 4 benefícios de prevenção veicular (alinhamento, balanceamento, ar-condicionado e rodízio) + clube de benefícios e promoções exclusivas das oficinas parceiras.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Cobrança: Mensal via PagSeguro</span>
              <Badge variant="success">Em Produção</Badge>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plano Credenciamento Parceiro</CardTitle>
              <Badge variant="warning">B2B — Oficina</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-extrabold text-slate-900">R$ 500,00</span>
              <span className="text-sm text-slate-500"> / mês (mensalidade SaaS)</span>
            </div>
            <p className="text-sm text-slate-600">
              Taxa de adesão e permanência para oficinas mecânicas parceiras. Inclui painel SaaS de gestão de box, validação de vouchers em tempo real e divulgação de ofertas para motoristas.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Cobrança: Mensal via PagSeguro</span>
              <Badge variant="success">Em Produção</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assinaturas Ativas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Assinaturas Recorrentes Registradas</h2>
          <span className="text-xs font-semibold text-slate-500">
            {subscriptions.length} {subscriptions.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Nenhuma assinatura ativa no momento</h3>
              <p className="text-xs text-slate-500 mt-1">
                À medida que motoristas e oficinas assinarem planos na plataforma, os registros aparecerão aqui em tempo real com status de pagamento e próximas renovações.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/clientes">
                <Button variant="outline" size="sm">Ver Motoristas</Button>
              </Link>
              <Link href="/oficinas">
                <Button variant="primary" size="sm">Ver Oficinas</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Assinante / Plano</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Ciclo</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Próxima Cobrança</th>
                    <th className="px-6 py-3">Início</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions.map((sub) => {
                    const badge = statusLabel(sub.status);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{sub.profile?.full_name ?? "Assinante"}</p>
                          <p className="text-xs text-slate-500">{sub.plan_name}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{formatCents(sub.amount_cents)}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 capitalize">{sub.billing_cycle}</td>
                        <td className="px-6 py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {sub.current_period_end ? formatDate(sub.current_period_end) : "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{formatDate(sub.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
