import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@grupo-j/ui-web";

export default function RelatoriosOficinaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios Operacionais</h1>
          <p className="text-sm text-slate-500 mt-1">Exportação de atendimentos e volumetria da sua unidade.</p>
        </div>
        <Button variant="primary" size="sm">Exportar CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Volumetria Semanal</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">42 manutenções preventivas concluídas com sucesso no período.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
