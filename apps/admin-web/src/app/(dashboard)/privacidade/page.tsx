import React from "react";
import { Card, CardHeader, CardTitle, CardContent, EmptyState, Button } from "@grupo-j/ui-web";

export default function PrivacidadePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacidade e Governança LGPD</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de pedidos de exclusão, exportação de dados (Art. 18 LGPD) e anonimização de titulares.
          </p>
        </div>
        <Button variant="outline" size="sm">Exportar Relatório de Impacto (DPO)</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requisições de Titulares de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nenhum pedido de exclusão pendente"
            description="Motoristas podem solicitar a exclusão ou exportação de dados diretamente pelo aplicativo mobile. As solicitações são enfileiradas aqui para conferência jurídica."
          />
        </CardContent>
      </Card>
    </div>
  );
}
