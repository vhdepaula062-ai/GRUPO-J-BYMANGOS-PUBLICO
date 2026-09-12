import React from "react";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@grupo-j/ui-web";

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trilha de Auditoria Imutável</h1>
        <p className="text-sm text-slate-500 mt-1">
          Registro criptográfico append-only de ações administrativas, concessões financeiras e sessões de emergência.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Auditados do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhuma anomalia de conformidade detectada"
            description="Todos os acessos e mutações financeiras são registrados de forma permanente na tabela audit_logs, protegida contra DELETE e UPDATE no PostgreSQL."
          />
        </CardContent>
      </Card>
    </div>
  );
}
