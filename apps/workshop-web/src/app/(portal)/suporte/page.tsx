import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@grupo-j/ui-web";

export default function SuporteOficinaPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Suporte Grupo J"
        subtitle="Canal de atendimento para oficinas credenciadas."
      />
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Canal em configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed">
            O canal oficial de suporte ainda não foi configurado. Assim que o número, o horário de atendimento e o sistema de chamados forem definidos, esta página permitirá abrir e acompanhar protocolos reais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
