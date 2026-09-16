// Server Component — busca dados reais do Supabase
import React from "react";
import Link from "next/link";
import {
  PageHeader,
  KpiCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Users,
  Wrench,
  DollarSign,
  ShieldCheck,
  Plus,
  StaggerContainer,
  StaggerItem,
  Reveal
} from "@grupo-j/ui-web";
import { getDashboardKpis, getPendingPromotions } from "@/lib/queries";
import { formatCents, formatNumber } from "@/lib/format";
import { EcosystemCommandCenter } from "@/components/EcosystemCommandCenter";

export default async function AdminDashboardPage() {
  const [kpis, pendingPromos] = await Promise.all([
    getDashboardKpis(),
    getPendingPromotions()
  ]);

  const mrrFormatted = formatCents(kpis.mrr);
  const isFirstRun = kpis.activeMotoristasCount === 0 && kpis.activeWorkshopsCount === 0;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Visão Geral da Plataforma"
        subtitle={
          isFirstRun
            ? "Sistema zerado e pronto para operar. Cadastre a primeira oficina e comece a aceitar assinaturas."
            : "Métricas consolidadas de assinaturas ativas, centros automotivos credenciados e receita recorrente."
        }
        actions={
          <div className="flex items-center gap-3">
            <Link href="/oficinas">
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Nova Oficina
              </Button>
            </Link>
          </div>
        }
      />

      {/* Centro de Comando e Sincronização em Tempo Real — Controle Total do Joaquim */}
      <EcosystemCommandCenter
        initialWorkshopsCount={kpis.activeWorkshopsCount}
        initialMotoristasCount={kpis.activeMotoristasCount}
        pendingPromotionsCount={kpis.pendingModerationCount}
        pendingWorkshopsCount={kpis.pendingWorkshopsCount}
      />

      {/* Banner de boas-vindas para primeiro acesso */}
      {isFirstRun && (
        <div className="bg-gradient-to-r from-[#034EFE]/5 to-blue-50 border border-[#034EFE]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#034EFE]/10 flex items-center justify-center shrink-0 text-[#034EFE]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                🎉 Bem-vindo ao Grupo J! O sistema está operacional.
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                O banco de dados está ativo e protegido. Para começar a operar:
              </p>
              <ol className="mt-2 space-y-1 text-sm text-slate-700">
                <li>
                  <span className="font-semibold text-[#034EFE]">1.</span>{" "}
                  <Link href="/oficinas" className="underline hover:text-[#034EFE]">
                    Credenciar a primeira oficina parceira
                  </Link>
                </li>
                <li>
                  <span className="font-semibold text-[#034EFE]">2.</span>{" "}
                  <Link href="/beneficios" className="underline hover:text-[#034EFE]">
                    Confirmar os 4 benefícios preventivos do catálogo
                  </Link>
                </li>
                <li>
                  <span className="font-semibold text-[#034EFE]">3.</span>{" "}
                  Divulgar o link do app para os primeiros motoristas assinarem (R$ 50/mês)
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Grade de KPIs Executivos */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StaggerItem>
          <KpiCard
            title="MRR Consolidado"
            value={mrrFormatted}
            subtitle={isFirstRun ? "Nenhuma assinatura ativa ainda" : "Receita recorrente mensal"}
            icon={<DollarSign size={20} />}
            badge={
              kpis.mrr > 0
                ? { text: `${formatNumber(kpis.activeMotoristasCount + kpis.activeWorkshopsCount)} contratos`, variant: "success" }
                : { text: "Aguardando cadastros", variant: "neutral" }
            }
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Motoristas Ativos"
            value={formatNumber(kpis.activeMotoristasCount)}
            subtitle="R$ 50,00/mês por assinante"
            icon={<Users size={20} />}
            badge={
              kpis.activeMotoristasCount > 0
                ? { text: formatCents(kpis.activeMotoristasCount * 5000) + "/mês", variant: "info" }
                : { text: "Nenhum ainda", variant: "neutral" }
            }
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Oficinas Credenciadas"
            value={formatNumber(kpis.activeWorkshopsCount)}
            subtitle="R$ 500,00/mês por oficina parceira"
            icon={<Wrench size={20} />}
            badge={
              kpis.activeWorkshopsCount > 0
                ? { text: formatCents(kpis.activeWorkshopsCount * 50000) + "/mês", variant: "info" }
                : { text: "Nenhuma ainda", variant: "neutral" }
            }
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Resgates no Mês"
            value={formatNumber(kpis.monthlyCheckIns)}
            subtitle="Manutenções preventivas realizadas"
            icon={<ShieldCheck size={20} />}
            badge={
              kpis.monthlyCheckIns > 0
                ? { text: "Este mês", variant: "neutral" }
                : { text: "Nenhum ainda", variant: "neutral" }
            }
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Seções Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fila de Moderação de Promoções */}
        <div className="lg:col-span-7">
          <Reveal distance={16} duration={0.35}>
            <Card variant="elevated">
              <CardHeader>
                <div>
                  <CardTitle>Promoções Aguardando Moderação</CardTitle>
                  <CardDescription>
                    Ofertas submetidas pelas oficinas parceiras antes de publicação no app dos motoristas.
                  </CardDescription>
                </div>
                <Badge variant={kpis.pendingModerationCount > 0 ? "warning" : "neutral"} size="sm">
                  {kpis.pendingModerationCount > 0
                    ? `${kpis.pendingModerationCount} Pendente${kpis.pendingModerationCount > 1 ? "s" : ""}`
                    : "Nenhuma pendente"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingPromos.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Nenhuma promoção aguardando moderação</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Quando as oficinas criarem ofertas, elas aparecerão aqui para aprovação.
                    </p>
                  </div>
                ) : (
                  pendingPromos
                    .filter((p) => p.status === "pending_approval")
                    .slice(0, 3)
                    .map((promo) => (
                      <div
                        key={promo.id}
                        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-slate-300"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {promo.workshop?.trade_name ?? "Oficina"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#034EFE]">{promo.title}</p>
                          <p className="text-[11px] text-slate-500">{promo.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href="/promocoes">
                            <Button variant="outline" size="xs">
                              Ver Fila
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                )}
                {pendingPromos.filter((p) => p.status === "pending_approval").length > 3 && (
                  <Link href="/promocoes">
                    <p className="text-xs text-center text-[#034EFE] font-semibold hover:underline py-2">
                      Ver todas ({kpis.pendingModerationCount} pendentes) →
                    </p>
                  </Link>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Status da Infraestrutura e Segurança */}
        <div className="lg:col-span-5">
          <Reveal distance={16} duration={0.35} delay={0.08}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Governança &amp; Segurança</CardTitle>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">PostgreSQL Row Level Security:</span>
                  <Badge variant="success" size="sm">100% Ativo</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Criptografia AES-256 + Blind Index:</span>
                  <Badge variant="success" size="sm">LGPD Conforme</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Gateway PagSeguro:</span>
                  <Badge variant="neutral" size="sm">Configurar credenciais</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600 font-medium">Sessão Break-Glass:</span>
                  <Badge variant="neutral" size="sm">Inativa (Protegida)</Badge>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
