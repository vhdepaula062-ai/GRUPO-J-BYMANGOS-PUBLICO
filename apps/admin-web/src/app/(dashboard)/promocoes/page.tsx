import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function PromocoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Moderação de Promoções</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aprovação, pausa ou exclusão de anúncios e ofertas criadas pelas oficinas parceiras.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fila de Moderação (1 pendente)</CardTitle>
            <Badge variant="warning">Aguardando Avaliação</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
            <div>
              <span className="text-xs font-semibold text-[#034EFE] uppercase">Auto Center Barra</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">20% de Desconto em Pastilhas de Freio</h4>
              <p className="text-sm text-slate-600 mt-1">Oferta exclusiva para motoristas cadastrados com assinatura ativa.</p>
              <p className="text-xs text-slate-400 mt-1">Vigência: 01/10/2026 até 31/10/2026</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="danger">Rejeitar</Button>
              <Button size="sm" variant="primary">Aprovar Anúncio</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
