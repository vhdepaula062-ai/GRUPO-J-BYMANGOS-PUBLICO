import { Badge, Card, CardContent, CardHeader, CardTitle, PageHeader } from "@grupo-j/ui-web";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";

type SubscriptionData = {
  id: string;
  status: string;
  current_period_end: string;
  plan: { name: string; price_cents: number } | null;
};

export default async function MensalidadeOficinaPage() {
  const workshop = await getMyWorkshop();
  const organizationId = workshop?.organization?.id as string | undefined;
  let subscription: SubscriptionData | null = null;
  let loadError = false;

  if (organizationId) {
    const supabase = createServerSupabaseClient();
    const result = await supabase
      .from("subscriptions")
      .select("id, status, current_period_end, plan:plans(name, price_cents)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    loadError = Boolean(result.error);
    subscription = result.data as unknown as SubscriptionData | null;
  }

  const amount = subscription?.plan
    ? (subscription.plan.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";
  const dueDate = subscription
    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
    : "—";
  const statusLabels: Record<string, string> = {
    active: "Ativa",
    pending: "Pendente",
    past_due: "Pagamento atrasado",
    paused: "Pausada",
    canceled: "Cancelada",
    failed: "Falhou"
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Assinatura B2B da Oficina"
        subtitle="Dados confirmados pelo cadastro de assinaturas do ecossistema Grupo J."
      />
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{subscription?.plan?.name ?? "Plano de oficina"}</CardTitle>
          {subscription && (
            <Badge variant={subscription.status === "active" ? "success" : "warning"}>
              {statusLabels[subscription.status] ?? subscription.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {loadError ? (
            <p className="text-sm text-rose-700">Não foi possível consultar a assinatura agora.</p>
          ) : !subscription ? (
            <p className="text-sm text-slate-600">Nenhuma assinatura vinculada a esta oficina.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs text-slate-500">Mensalidade</span>
                <p className="text-xl font-black text-slate-900">{amount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs text-slate-500">Fim do período atual</span>
                <p className="text-xl font-black text-slate-900">{dueDate}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500">
            A emissão de Pix, troca de cartão e comprovantes será liberada após a homologação do gateway de pagamentos contratado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
