// Server Component — Painel da Oficina com dados reais do Supabase
import React from "react";
import Link from "next/link";
import {
  PageHeader,
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  StatusBadge,
  DataTable,
  Users,
  Wrench,
  Receipt,
  Award,
  Zap,
  Clock,
  ArrowRight,
  StaggerContainer,
  StaggerItem,
  Reveal
} from "@grupo-j/ui-web";
import { getMyWorkshop, getWorkshopKpis, getWorkshopServices } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";

export default async function WorkshopDashboardPage() {
  const workshop = await getMyWorkshop();
  const workshopId = workshop?.organization?.id as string | undefined;

  const [kpis, services] = workshopId
    ? await Promise.all([
        getWorkshopKpis(workshopId),
        getWorkshopServices(workshopId)
      ])
    : [
        { linkedCustomers: 0, monthlyCheckIns: 0, subscriptionStatus: "unavailable", pendingAppointments: 0 },
        []
      ];

  const isPendingApproval = workshop?.organization?.status === "pending_approval";
  const isFirstRun = !isPendingApproval && kpis.linkedCustomers === 0 && kpis.monthlyCheckIns === 0;
  const recentServices = services.slice(0, 10);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={
          workshop?.organization?.trade_name
            ? `Painel — ${workshop.organization.trade_name as string}`
            : "Painel da Oficina"
        }
        subtitle={
          isPendingApproval
            ? "Credenciamento em análise pela diretoria do Grupo J. Suas ferramentas operacionais serão liberadas assim que a homologação for concluída no Painel Central."
            : isFirstRun
            ? "Sua oficina está ativa no sistema! Quando os primeiros motoristas chegarem, aparecerão aqui."
            : "Resumo operacional de atendimentos preventivos, agendamentos do dia e mensalidade parceira."
        }
        actions={
          isPendingApproval ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300/80 text-xs font-black shadow-sm">
              <Clock size={14} className="animate-pulse text-amber-600" />
              <span>Aguardando Aprovação do Joaquim</span>
            </div>
          ) : (
            <Link href="/check-in">
              <Button
                variant="primary"
                size="md"
                className="font-bold shadow-md shadow-blue-600/20"
                leftIcon={<Zap size={16} className="text-amber-300" />}
              >
                ⚡ Novo Check-in de Veículo
              </Button>
            </Link>
          )
        }
      />

      {/* Banner de status pendente de homologação */}
      {isPendingApproval ? (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
              <Clock size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">
                  Proposta de Credenciamento sob Análise da Diretoria ⏳
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Pendente de Homologação
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Seu estabelecimento foi registrado com sucesso e está na mesa de moderação do administrador (Joaquim).
                Enquanto o cadastro estiver pendente de aprovação, os módulos operacionais de validação de vouchers e check-in permanecem em modo protegido.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5 pt-1">
                <Link href="/configuracoes">
                  <Button variant="outline" size="sm" className="bg-white/80 text-xs font-bold border-amber-200 text-slate-800">
                    Verificar Dados da Oficina
                  </Button>
                </Link>
                <Link href="/suporte">
                  <Button variant="outline" size="sm" className="bg-white/80 text-xs font-bold border-amber-200 text-slate-800">
                    Falar com o Credenciamento
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : isFirstRun ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Oficina credenciada e pronta para operar! 🎉
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Assim que um motorista com assinatura ativa chegar, use o{" "}
                <Link href="/check-in" className="font-bold text-emerald-700 underline">
                  Validador de Voucher
                </Link>{" "}
                para registrar o atendimento.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/check-in">
                  <Button variant="primary" size="sm">⚡ Abrir Validador</Button>
                </Link>
                <Link href="/configuracoes">
                  <Button variant="outline" size="sm">Completar Perfil da Oficina</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Grade de KPIs */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StaggerItem>
          <KpiCard
            title="Clientes Vinculados"
            value={String(kpis.linkedCustomers)}
            subtitle={kpis.linkedCustomers === 0 ? "Aguardando primeiros motoristas" : "Motoristas que escolheram esta unidade"}
            icon={<Users size={20} />}
            badge={kpis.linkedCustomers > 0 ? { text: "Rede ativa", variant: "success" } : { text: "Nenhum ainda", variant: "neutral" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Atendimentos no Mês"
            value={String(kpis.monthlyCheckIns)}
            subtitle={kpis.monthlyCheckIns === 0 ? "Nenhum este mês ainda" : "Serviços concluídos este mês"}
            icon={<Wrench size={20} />}
            badge={kpis.monthlyCheckIns > 0 ? { text: "Em dia", variant: "info" } : { text: "Aguardando", variant: "neutral" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Mensalidade B2B"
            value={kpis.subscriptionStatus === "active" ? "Ativa" : kpis.subscriptionStatus === "trial" ? "Em teste" : "Consultar"}
            subtitle="Situação contratual; não comprova pagamento"
            icon={<Receipt size={20} />}
            badge={{ text: "Consultar assinatura", variant: "neutral" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Aguardando Validação"
            value={String(kpis.pendingAppointments)}
            subtitle={kpis.pendingAppointments === 0 ? "Nenhum voucher pendente" : "Vouchers chegando para validar"}
            icon={<Award size={20} />}
            badge={kpis.pendingAppointments > 0 ? { text: "Ação necessária!", variant: "warning" } : { text: "Tudo ok", variant: "neutral" }}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Card de Atalho de Validação */}
      <Reveal distance={16} duration={0.35}>
        <div className="bg-gradient-to-r from-[#00091D] to-[#041129] rounded-2xl p-6 text-white border border-[#13254A] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-left w-full">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Clock size={12} />
              <span>Validação Rápida</span>
            </div>
            <h3 className="text-lg font-bold text-white">Motorista chegou com voucher?</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Insira o código completo do voucher no check-in para liberar o benefício preventivo após conferir os dados.
            </p>
          </div>
          <Link href="/check-in" className="shrink-0 w-full md:w-auto">
            <Button variant="primary" size="md" className="w-full md:w-auto shadow-md shadow-blue-600/30" rightIcon={<ArrowRight size={16} />}>
              Abrir Validador 10min
            </Button>
          </Link>
        </div>
      </Reveal>

      {/* Tabela de Atendimentos Recentes */}
      <Reveal distance={16} duration={0.35}>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Atendimentos Recentes</CardTitle>
            <span className="text-xs text-slate-400 font-medium">Dados reais do banco</span>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={[
                {
                  key: "plate",
                  header: "Placa / Veículo",
                  render: (item) => (
                    <div>
                      <span className="font-bold text-slate-900 font-mono tracking-wider">
                        {item.vehicle?.plate ?? "—"}
                      </span>
                      <span className="block text-xs text-slate-500 font-sans">
                        {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : "—"}
                      </span>
                    </div>
                  )
                },
                {
                  key: "benefit",
                  header: "Benefício Resgatado",
                  render: (item) => (
                    <span className="font-semibold text-slate-800">{item.benefit?.name ?? "—"}</span>
                  )
                },
                {
                  key: "created_at",
                  header: "Data / Horário",
                  render: (item) => (
                    <span className="text-xs text-slate-500 font-medium">{formatDateTime(item.created_at)}</span>
                  )
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item) => <StatusBadge status={item.status} size="sm" />
                },
                {
                  key: "actions",
                  header: "Ações",
                  align: "right",
                  render: () => (
                    <Link href="/servicos" className="text-blue-700 underline">
                      Ver O.S.
                    </Link>
                  )
                }
              ]}
              data={recentServices}
              keyExtractor={(item) => item.id}
              emptyTitle="Nenhum atendimento registrado ainda"
              emptyDescription="Use o validador de voucher para registrar o primeiro atendimento quando o motorista chegar."
            />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
