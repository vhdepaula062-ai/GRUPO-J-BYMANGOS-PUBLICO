import {ActionForm} from "@grupo-j/ui-web";
import {createAuthorizedAdminClient} from "@/lib/supabase/authorized";
import {createPlan,grantTrial} from "./actions";
import {randomUUID} from "node:crypto";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, CreditCard } from "@grupo-j/ui-web";
import { readFinancialRows } from "@/lib/financial-data";
import { getSubscriptions } from "@/lib/queries";
import { formatCents, formatDate, statusLabel } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const [subscriptions, plans] = await Promise.all([getSubscriptions(), readFinancialRows("plans", "id, name, description, audience, price_cents, billing_interval_months, is_active")]);

  const db=await createAuthorizedAdminClient();const benefits=await db.from("benefit_definitions").select("id,name").eq("is_active",true);if(benefits.error)throw new Error("Falha ao consultar benefícios.");
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

      <p className="text-sm text-amber-800">Gateway ainda não homologado. Valores dos planos são preços de catálogo, não pagamentos recebidos.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.filter(plan => plan.is_active).map(plan => <Card key={plan.id} variant="elevated">
          <CardHeader><CardTitle>{plan.name}</CardTitle><Badge variant="info">{plan.audience === "customer" ? "Motorista" : "Oficina"}</Badge></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCents(plan.price_cents)}</p><p>A cada {plan.billing_interval_months} mês(es)</p><p className="text-sm text-slate-500">{plan.description}</p></CardContent>
        </Card>)}
      </div>

      <details className="bg-white border p-6 rounded-xl"><summary className="font-bold cursor-pointer">Criar nova oferta de plano</summary><p>Alterações de preço são novas ofertas; assinaturas existentes mantêm o plano contratado.</p><ActionForm action={createPlan} submitLabel="Criar plano" reset>
<label>Nome<input className="block border p-2" name="name" required minLength={3}/></label><label>Público<select name="audience" className="block border p-2"><option value="customer">Motorista</option><option value="workshop">Oficina</option></select></label><label>Preço em reais<input name="price" type="number" min="0.01" step="0.01" required className="block border p-2"/></label><label>Intervalo em meses<input name="months" type="number" min="1" max="12" defaultValue="1" className="block border p-2"/></label><fieldset><legend>Benefícios incluídos</legend>{benefits.data.map(b=><label key={b.id} className="block"><input type="checkbox" name="benefits" value={b.id}/> {b.name}</label>)}</fieldset></ActionForm></details>
<details className="bg-white border p-6 rounded-xl"><summary className="font-bold cursor-pointer">Conceder período gratuito</summary><p>Sem cobrança e sem renovação automática. Não substitui um contrato ainda vigente.</p><ActionForm key={subscriptions.length} action={grantTrial} submitLabel="Conceder período"><input name="key" type="hidden" value={randomUUID()}/><label>Plano<select name="plan" className="block border p-2">{plans.filter(p=>p.is_active).map(p=><option key={p.id} value={p.id}>{p.name} — {p.audience==="customer"?"Motorista":"Oficina"}</option>)}</select></label><label>Público<select name="audience" className="block border p-2"><option value="customer">Motorista</option><option value="workshop">Oficina</option></select></label><label>E-mail cadastrado<input name="email" type="email" required className="block border p-2"/></label><label>Duração em dias<input name="days" type="number" min="1" max="365" defaultValue="30" className="block border p-2"/></label><label>Justificativa<textarea name="reason" required minLength={10} maxLength={1000} className="block border p-2 w-full"/></label></ActionForm></details>
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
                À medida que motoristas e oficinas assinarem planos na plataforma, os registros aparecerão aqui em tempo real com situação contratual e período de vigência. O status da assinatura não comprova pagamento.
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
                    <th className="px-6 py-3">Fim do período</th>
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
