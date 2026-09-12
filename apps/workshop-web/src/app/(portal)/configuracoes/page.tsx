import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from "@grupo-j/ui-web";

export default function ConfiguracoesOficinaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações da Oficina</h1>
        <p className="text-sm text-slate-500 mt-1">Horário de funcionamento e perfil público exibido no aplicativo do motorista.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Horário de Funcionamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Segunda a Sexta" defaultValue="08:00 às 18:00" />
          <Input label="Sábado" defaultValue="08:00 às 13:00" />
          <div className="pt-2">
            <Button variant="primary">Salvar Horários</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
