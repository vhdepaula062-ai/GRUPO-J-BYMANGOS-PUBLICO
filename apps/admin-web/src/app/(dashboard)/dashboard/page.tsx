import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@grupo-j/ui-web";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Visão Geral da Plataforma
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas consolidadas de assinaturas, oficinas credenciadas e resgates preventivos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Exportar Relatório
          </Button>
          <Button variant="primary" size="sm">
            + Nova Oficina
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Motoristas Ativos
              </span>
              <Badge variant="success">+12% este mês</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">1.428</p>
            <p className="text-xs text-slate-500 mt-1">R$ 50,00/mês por assinante</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Oficinas Credenciadas
              </span>
              <Badge variant="info">Rede Ativa</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">36</p>
            <p className="text-xs text-slate-500 mt-1">R$ 500,00/mês por oficina parceira</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                MRR Total
              </span>
              <Badge variant="success">Auditado</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">R$ 89.400,00</p>
            <p className="text-xs text-slate-500 mt-1">Receita recorrente mensal consolidada</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Resgates no Mês
              </span>
              <Badge variant="neutral">Prevenção</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">412</p>
            <p className="text-xs text-slate-500 mt-1">Serviços executados na rede</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Operacional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Promoções Aguardando Moderação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Auto Center Barra — Desconto em Pastilhas de Freio
                  </p>
                  <p className="text-xs text-slate-500">20% de desconto para assinantes ativos</p>
                </div>
                <Button size="sm" variant="outline">
                  Avaliar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Infraestrutura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">PostgreSQL com Row Level Security:</span>
                <Badge variant="success">Operacional</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Gateway de Pagamentos:</span>
                <Badge variant="info">Ambiente Homologado</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Sessão Técnica Break-Glass:</span>
                <Badge variant="neutral">Inativa (Segura)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
