import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState } from "@grupo-j/ui-web";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão Financeira & Conciliação</h1>
          <p className="text-sm text-slate-500 mt-1">
            Faturamento automatizado por Webhook do Gateway. Isenções e descontos com auditoria e reversão.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">+ Conceder Isenção / Desconto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Recebidos no Mês</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">R$ 89.400,00</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">100% conciliado via Webhook</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Isenções Ativas Concedidas</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">4</p>
            <p className="text-xs text-slate-500 mt-1">Auditadas com motivo e vigência</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Inadimplência</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">1,2%</p>
            <p className="text-xs text-slate-500 mt-1">Cobranças pendentes em retentativa</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações Financeiras (Imutável)</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhuma pendência de conciliação no momento"
            description="Todas as transações de pagamento foram processadas diretamente pelos eventos oficiais do Gateway de Pagamentos."
          />
        </CardContent>
      </Card>
    </div>
  );
}
