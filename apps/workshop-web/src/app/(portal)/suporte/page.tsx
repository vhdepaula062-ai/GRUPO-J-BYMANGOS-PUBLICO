import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@grupo-j/ui-web";

export default function SuporteOficinaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suporte Direto Grupo J</h1>
        <p className="text-sm text-slate-500 mt-1">Canal exclusivo de atendimento para oficinas parceiras credenciadas.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Canais de Contato</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-[#034EFE]">WhatsApp de Atendimento a Oficinas</h4>
            <p className="text-xs text-slate-600 mt-1">Suporte técnico para validação de vouchers e faturamento: (11) 99999-8888</p>
          </div>
          <div>
            <Button variant="primary">Chamar Suporte no WhatsApp</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
