import { Card, CardContent, CardHeader, CardTitle, PageHeader } from "@grupo-j/ui-web";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ErasureRequest = {
  id: string;
  protocol: string;
  status: string;
  requested_at: string;
  deadline_at: string;
  notes: string | null;
};

export default async function PrivacidadePage() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("account_erasure_requests")
    .select("id, protocol, status, requested_at, deadline_at, notes")
    .order("requested_at", { ascending: false })
    .limit(100);
  const requests = (data ?? []) as ErasureRequest[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacidade e Governança LGPD"
        subtitle="Solicitações de exclusão registradas pelos titulares no ecossistema."
      />
      <Card variant="elevated">
        <CardHeader><CardTitle>Solicitações de titulares</CardTitle></CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-rose-700">Não foi possível consultar as solicitações: {error.message}</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-slate-600">Nenhuma solicitação de exclusão registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-slate-500"><th className="py-3">Protocolo</th><th>Status</th><th>Solicitada em</th><th>Prazo</th></tr></thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-100">
                      <td className="py-3 font-mono">{request.protocol}</td>
                      <td>{request.status}</td>
                      <td>{new Date(request.requested_at).toLocaleDateString("pt-BR")}</td>
                      <td>{new Date(request.deadline_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
