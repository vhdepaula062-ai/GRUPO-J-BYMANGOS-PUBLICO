import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";
import { mockDriverPlan, mockWorkshopPlan } from "@grupo-j/test-utils";

export default function AssinaturasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Planos e Assinaturas</h1>
          <p className="text-sm text-slate-500 mt-1">Planos versionados e precificação recorrente configurada no banco.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{mockDriverPlan.name}</CardTitle>
              <Badge variant="info">B2C — Motorista</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-extrabold text-slate-900">R$ 50,00</span>
              <span className="text-sm text-slate-500"> / mês (armazenado como 5000 centavos)</span>
            </div>
            <p className="text-sm text-slate-600">{mockDriverPlan.description}</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Versão ativa: v{mockDriverPlan.version}</span>
              <Button size="sm" variant="outline">Editar Parâmetros</Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{mockWorkshopPlan.name}</CardTitle>
              <Badge variant="warning">B2B — Oficina</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-extrabold text-slate-900">R$ 500,00</span>
              <span className="text-sm text-slate-500"> / mês (armazenado como 50000 centavos)</span>
            </div>
            <p className="text-sm text-slate-600">{mockWorkshopPlan.description}</p>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Versão ativa: v{mockWorkshopPlan.version}</span>
              <Button size="sm" variant="outline">Editar Parâmetros</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
