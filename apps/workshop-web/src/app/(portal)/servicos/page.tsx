import React from "react";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@grupo-j/ui-web";

export default function ServicosOficinaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Histórico de Serviços Prestados</h1>
        <p className="text-sm text-slate-500 mt-1">Evidências fotográficas e comprovantes de benefícios resgatados na sua unidade.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Concluídos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Todos os serviços executados estão em dia"
            description="Após a finalização do check-in e upload da foto da placa, o registro imutável do atendimento é consolidado aqui."
          />
        </CardContent>
      </Card>
    </div>
  );
}
