import React from "react";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@grupo-j/ui-web";

export default function AgendaOficinaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda de Agendamentos</h1>
        <p className="text-sm text-slate-500 mt-1">Horários marcados por motoristas para revisões preventivas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhum agendamento futuro para hoje"
            description="Motoristas com benefícios disponíveis podem agendar revisões preventivas diretamente pelo aplicativo mobile."
          />
        </CardContent>
      </Card>
    </div>
  );
}
