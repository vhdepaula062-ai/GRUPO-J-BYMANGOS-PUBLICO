import React from "react";
import { Card, CardContent, Badge, Button } from "@grupo-j/ui-web";
import { mockWorkshop } from "@grupo-j/test-utils";

export default function OficinasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Oficinas Parceiras (Centros Automotivos)</h1>
          <p className="text-sm text-slate-500 mt-1">Rede credenciada com acesso isolado ao SaaS das oficinas.</p>
        </div>
        <Button variant="primary" size="sm">+ Credenciar Oficina</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Auto Mecânica Modelo Barra</h3>
                <p className="text-xs text-slate-500 mt-0.5">{mockWorkshop.addressStreet}, {mockWorkshop.addressNumber} — {mockWorkshop.addressNeighborhood}, {mockWorkshop.addressCity}/{mockWorkshop.addressState}</p>
              </div>
              <Badge variant="success">Credenciada (R$ 500/mês)</Badge>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600">Avaliação Média: <strong>★ {mockWorkshop.ratingAverage}</strong> ({mockWorkshop.ratingCount} avaliações)</span>
              <Button size="sm" variant="outline">Gerenciar Unidade</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
