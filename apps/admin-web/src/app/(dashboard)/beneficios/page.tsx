import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function BeneficiosPage() {
  const benefits = [
    {
      name: "Alinhamento 3D e Balanceamento",
      periodicity: "Semestral (2 por ciclo)",
      status: "Ativo",
      gracePeriod: "0 dias",
      oilIncluded: false
    },
    {
      name: "Cristalização de Para-brisa",
      periodicity: "Semestral (2 por ciclo)",
      status: "Ativo",
      gracePeriod: "0 dias",
      oilIncluded: false
    },
    {
      name: "Check-up Preventivo 50 Itens",
      periodicity: "Trimestral (4 por ciclo)",
      status: "Ativo",
      gracePeriod: "0 dias",
      oilIncluded: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Benefícios</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configuração de periodicidade, limites e carências de manutenção preventiva para motoristas.
          </p>
        </div>
        <Button variant="primary" size="sm">+ Adicionar Benefício</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((b) => (
          <Card key={b.name} variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{b.name}</CardTitle>
                <Badge variant="success">{b.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p><strong>Periodicidade:</strong> {b.periodicity}</p>
              <p><strong>Carência:</strong> {b.gracePeriod}</p>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button size="sm" variant="outline">Editar Regras</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
