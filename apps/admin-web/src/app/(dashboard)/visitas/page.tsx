import React from "react";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@grupo-j/ui-web";

export default function VisitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check-ins & Visitas em Oficinas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Registro em tempo real de motoristas presentes nas oficinas credenciadas e validações de vouchers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhum atendimento em andamento no momento"
            description="Os check-ins realizados pelos atendentes das oficinas através do portal workshop-web serão exibidos aqui com fotos de evidência e status."
          />
        </CardContent>
      </Card>
    </div>
  );
}
