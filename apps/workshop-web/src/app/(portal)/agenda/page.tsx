import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@grupo-j/ui-web";

export default function AgendaOficinaPage() {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Agenda Operacional"
        subtitle="Agendamentos de atendimentos da oficina."
      />
      <Card variant="elevated">
        <CardHeader><CardTitle>Agenda ainda não habilitada</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            O banco atual ainda não possui o módulo de agendamentos. A tela permanecerá somente para consulta até que horários, disponibilidade e notificações sejam modelados e homologados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
