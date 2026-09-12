"use client";

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
  Download,
  Plus,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  Reveal
} from "@grupo-j/ui-web";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Visão Geral da Plataforma"
        subtitle="Métricas consolidadas de assinaturas ativas, centros automotivos credenciados e receita recorrente."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
              Exportar Relatório
            </Button>
            <Link href="/oficinas">
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
                Nova Oficina
              </Button>
            </Link>
          </div>
        }
      />

      {/* Grade de KPIs Executivos com Entrada em Stagger */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StaggerItem>
          <KpiCard
            title="MRR Consolidado"
            value={<AnimatedCounter value={89400} prefix="R$ " suffix=",00" duration={1.1} />}
            subtitle="Receita recorrente mensal auditada"
            icon={<DollarSign size={20} />}
            badge={{ text: "+14% vs. mês ant.", variant: "success" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Motoristas Ativos"
            value={<AnimatedCounter value={1428} duration={0.9} />}
            subtitle="R$ 50,00/mês por assinante"
            icon={<Users size={20} />}
            badge={{ text: "R$ 71.400/mês", variant: "info" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Oficinas Credenciadas"
            value={<AnimatedCounter value={36} duration={0.8} />}
            subtitle="R$ 500,00/mês por oficina parceira"
            icon={<Wrench size={20} />}
            badge={{ text: "R$ 18.000/mês", variant: "info" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Resgates no Mês"
            value={<AnimatedCounter value={412} duration={0.9} />}
            subtitle="Manutenções preventivas realizadas"
            icon={<ShieldCheck size={20} />}
            badge={{ text: "Sinistralidade 28%", variant: "neutral" }}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Seções Operacionais Executivas com Entrada Suave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fila de Moderação de Promoções das Oficinas */}
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
                <Badge variant="warning" size="sm">
                  1 Pendente
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-slate-300">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Auto Center Barra
                      </span>
                      <span className="text-xs text-slate-400">• Rio de Janeiro/RJ</span>
                    </div>
                    <p className="text-xs font-semibold text-[#034EFE]">
                      20% de Desconto em Troca de Pastilhas Dianteiras
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Vigência: 01/10/2026 a 31/10/2026 — Exclusivo para assinantes ativos
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="xs">
                      Recusar
                    </Button>
                    <Button variant="primary" size="xs">
                      Aprovar Oferta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Status da Infraestrutura e Segurança */}
        <div className="lg:col-span-5">
          <Reveal distance={16} duration={0.35} delay={0.08}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Governança & Segurança</CardTitle>
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
                  <span className="text-slate-600 font-medium">Gateway Mercado Pago:</span>
                  <Badge variant="info" size="sm">Idempotência OK</Badge>
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
