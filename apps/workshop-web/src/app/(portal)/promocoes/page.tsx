import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function PromocoesOficinaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Promoções & Ofertas Locais</h1>
          <p className="text-sm text-slate-500 mt-1">
            Crie ofertas exclusivas para motoristas da rede Grupo J. Toda promoção passa por moderação da matriz.
          </p>
        </div>
        <Button variant="primary" size="sm">+ Nova Promoção</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>20% de Desconto em Pastilhas de Freio</CardTitle>
              <Badge variant="warning">Em Moderação</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Válido para troca de pastilhas dianteiras em veículos de passeio.</p>
            <p className="text-xs text-slate-400">Vigência: 01/10/2026 até 31/10/2026</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
