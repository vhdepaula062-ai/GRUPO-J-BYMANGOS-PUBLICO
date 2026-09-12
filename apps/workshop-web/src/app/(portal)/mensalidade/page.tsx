import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function MensalidadeOficinaPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assinatura B2B da Oficina</h1>
        <p className="text-sm text-slate-500 mt-1">Gestão da mensalidade de credenciamento na rede Grupo J.</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plano Centro Automotivo Credenciado</CardTitle>
            <Badge variant="success">Assinatura Ativa</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-3xl font-extrabold text-slate-900">R$ 500,00</span>
            <span className="text-sm text-slate-500"> / mês (armazenado como 50000 centavos)</span>
          </div>
          <p className="text-sm text-slate-600">
            Acesso ilimitado ao SaaS de atendimento, credenciamento no aplicativo de motoristas e recebimento de clientes da rede.
          </p>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Próximo Vencimento:</span>
              <span className="font-semibold text-slate-900">10/10/2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Forma de Cobrança:</span>
              <span className="text-slate-900">Cartão de Crédito Corporativo (final 8842)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button size="sm" variant="outline">Alterar Cartão</Button>
            <Button size="sm" variant="primary">Histórico de Faturas</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
