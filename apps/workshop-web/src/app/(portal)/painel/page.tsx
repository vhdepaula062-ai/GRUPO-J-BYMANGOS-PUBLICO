"use client";

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
  AnimatedCounter,
  Reveal
} from "@grupo-j/ui-web";

interface Atendimento {
  id: string;
  plate: string;
  model: string;
  benefit: string;
  time: string;
  status: string;
}

const mockAtendimentos: Atendimento[] = [
  {
    id: "1",
    plate: "BRA2E19",
    model: "VW Gol 1.6 MSI",
    benefit: "Alinhamento 3D e Balanceamento",
    time: "Hoje às 10:30",
    status: "Concluído"
  },
  {
    id: "2",
    plate: "RIO9X88",
    model: "Fiat Strada Volcano",
    benefit: "Higienização de Ar-Condicionado",
    time: "Hoje às 11:15",
    status: "Concluído"
  },
  {
    id: "3",
    plate: "SPK4B22",
    model: "Hyundai HB20 Comfort",
    benefit: "Rodízio e Balanceamento",
    time: "Hoje às 14:00",
    status: "Em Andamento"
  }
];

export default function WorkshopDashboardPage() {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Painel da Oficina"
        subtitle="Resumo operacional de atendimentos preventivos, agendamentos do dia e mensalidade parceira."
        actions={
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
        }
      />

      {/* Grade de KPIs Executivos da Oficina em Stagger */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StaggerItem>
          <KpiCard
            title="Clientes Vinculados"
            value={<AnimatedCounter value={184} duration={0.9} />}
            subtitle="Motoristas que escolheram esta unidade"
            icon={<Users size={20} />}
            badge={{ text: "+14 este mês", variant: "success" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Atendimentos no Mês"
            value={<AnimatedCounter value={42} duration={0.8} />}
            subtitle="100% de vouchers elegíveis validados"
            icon={<Wrench size={20} />}
            badge={{ text: "Metas em dia", variant: "info" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Mensalidade B2B"
            value="R$ 500,00"
            subtitle="Vencimento todo dia 10 (fatura paga)"
            icon={<Receipt size={20} />}
            badge={{ text: "Em dia", variant: "success" }}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Avaliação da Rede"
            value="4.9 ★"
            subtitle="Índice de satisfação dos motoristas"
            icon={<Award size={20} />}
            badge={{ text: "Excelente", variant: "success" }}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Card de Atalho em Destaque com Entrada Suave */}
      <Reveal distance={16} duration={0.35}>
        <div className="bg-gradient-to-r from-[#00091D] to-[#041129] rounded-2xl p-6 text-white border border-[#13254A] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg transition-all duration-300 hover:border-blue-900/80">
          <div className="space-y-1 text-left w-full">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Clock size={12} />
              <span>Validação Rápida</span>
            </div>
            <h3 className="text-lg font-bold text-white">Motorista chegou na oficina com voucher?</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Insira o código do voucher ou placa no check-in para liberar o benefício preventivo em menos de 10 segundos.
            </p>
          </div>
          <Link href="/check-in" className="shrink-0 w-full md:w-auto">
            <Button variant="primary" size="md" className="w-full md:w-auto shadow-md shadow-blue-600/30" rightIcon={<ArrowRight size={16} />}>
              Abrir Validador 120s
            </Button>
          </Link>
        </div>
      </Reveal>

      {/* Tabela de Atendimentos Recentes */}
      <Reveal distance={16} duration={0.35}>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Atendimentos Realizados Recentemente</CardTitle>
            <span className="text-xs text-slate-400 font-medium">Atualizado em tempo real</span>
          </CardHeader>
          <CardContent className="p-0">
          <DataTable
            columns={[
              {
                key: "plate",
                header: "Placa / Veículo",
                render: (item) => (
                  <div>
                    <span className="font-bold text-slate-900 font-mono tracking-wider">{item.plate}</span>
                    <span className="block text-xs text-slate-500 font-sans">{item.model}</span>
                  </div>
                )
              },
              {
                key: "benefit",
                header: "Benefício Resgatado",
                render: (item) => (
                  <span className="font-semibold text-slate-800">{item.benefit}</span>
                )
              },
              {
                key: "time",
                header: "Data / Horário",
                render: (item) => (
                  <span className="text-xs text-slate-500 font-medium">{item.time}</span>
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
                  <Button variant="outline" size="xs">
                    Ver O.S.
                  </Button>
                )
              }
            ]}
            data={mockAtendimentos}
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
