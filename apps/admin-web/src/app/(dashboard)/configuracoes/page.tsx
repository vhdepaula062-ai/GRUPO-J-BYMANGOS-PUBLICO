import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações Remotas Versionadas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle centralizado de parâmetros de negócio, feature flags, preços e regras de carência.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">Histórico & Rollback</Button>
          <Button variant="primary" size="sm">+ Publicar Nova Versão</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Regras de Negócio Globais</CardTitle>
              <Badge variant="success">Versão Ativa: v1.4</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Trava Mínima de Troca de Oficina:</span>
              <span className="font-semibold text-slate-900">30 dias (Inegociável)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Preço Base Motorista:</span>
              <span className="font-semibold text-slate-900">R$ 50,00 (5000 centavos)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span>Preço Mensalidade Oficina:</span>
              <span className="font-semibold text-slate-900">R$ 500,00 (50000 centavos)</span>
            </div>
            <div className="flex justify-between py-2">
              <span>TTL do Voucher QR Code:</span>
              <span className="font-semibold text-slate-900">120 segundos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso Técnico Emergencial (Break-Glass)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <p className="text-slate-500 text-xs">
              Permite a abertura temporária de sessão auditada para a equipe de engenharia da Mangos.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs">
              Sessões break-glass exigem justificativa formal, autorização do proprietário, MFA e expiram em no máximo 120 minutos.
            </div>
            <div className="pt-2">
              <Button size="sm" variant="outline">Gerar Autorização Emergencial</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
