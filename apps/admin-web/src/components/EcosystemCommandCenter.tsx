"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Zap,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Download
} from "@grupo-j/ui-web";
import { syncEcosystemAction, type SyncEcosystemResult } from "@/app/actions/sync-ecosystem";

export interface EcosystemCommandCenterProps {
  initialWorkshopsCount?: number;
  initialMotoristasCount?: number;
  pendingPromotionsCount?: number;
  pendingWorkshopsCount?: number;
}

export function EcosystemCommandCenter({
  initialWorkshopsCount = 0,
  initialMotoristasCount = 0,
  pendingPromotionsCount = 0,
  pendingWorkshopsCount = 0
}: EcosystemCommandCenterProps) {
  const [isPending, startTransition] = useTransition();
  const [syncData, setSyncData] = useState<SyncEcosystemResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Ainda não consultado");
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleSyncEcosystem = () => {
    startTransition(async () => {
      const result = await syncEcosystemAction();
      setSyncData(result);
      setLastSyncTime(result.timestamp);
    });
  };

  const handleExportConsolidatedReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Indicador,Quantidade,Consulta\n" +
      `Oficinas ativas,${initialWorkshopsCount},${lastSyncTime}\n` +
      `Motoristas cadastrados,${initialMotoristasCount},${lastSyncTime}\n` +
      "Conciliação financeira,Não integrada,Não verificada\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-consolidado-grupo-j-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage("Relatório consolidado exportado com sucesso!");
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Banner Principal de Controle Total e Sincronização */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00091D] via-[#041129] to-[#001438] p-6 text-white border border-[#13254A] shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30 backdrop-blur-sm">
              <Zap size={13} className="text-amber-300 animate-pulse" />
              <span>Centro de Consulta do Ecossistema</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Controle Total do Ecossistema Grupo J
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Atualização das consultas deste painel. A confirmação de pagamentos depende da integração e conciliação com o gateway.
            </p>
          </div>

          {/* Botão de Ação Central: Sincronizar Tudo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSyncEcosystem}
              disabled={isPending}
              className="bg-[#034EFE] hover:bg-blue-600 text-white font-black shadow-lg shadow-blue-600/40 border border-blue-400/30 px-6"
              leftIcon={
                <RefreshCw
                  size={18}
                  className={isPending ? "animate-spin text-amber-300" : "text-amber-300"}
                />
              }
            >
              {isPending ? "Sincronizando Rede..." : "Atualizar consultas do painel"}
            </Button>
          </div>
        </div>

        {/* Notificação de Sincronia Concluída */}
        {syncData && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{syncData.message}</span>
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              Latência: {syncData.latencyMs}ms • Horário: {syncData.timestamp}
            </span>
          </div>
        )}

        {exportMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Grid dos 3 Nós do Ecossistema em Alta Velocidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
          {/* Nó 1: Governança Admin */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">1. Admin Corporativo</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Consulta ao banco
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Informações consultadas pelo perfil administrativo
            </p>
          </div>

          {/* Nó 2: Portal de Oficinas */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">2. Portal de Oficinas</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Pronto para Atendimento
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Validador de Vouchers integrado • Repasses ainda não integrados
            </p>
          </div>

          {/* Nó 3: App & Benefícios */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">3. Benefícios & Motoristas</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Catálogo cadastrado
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Benefícios conforme as regras vigentes no banco
            </p>
          </div>
        </div>
      </div>

      {/* Matriz de Ações Rápidas de Controle para o Joaquim */}
      <Card variant="default" className="border-slate-200/90 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Ações Imediatas de Gestão da Rede
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Atalhos operacionais rápidos para o diretor e equipe de governança.
              </CardDescription>
            </div>
            <span className="text-[11px] text-slate-400">
              Última conferência da rede: <strong className="text-slate-600">{lastSyncTime}</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link href="/promocoes">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
                leftIcon={<TrendingUp size={14} className="text-[#034EFE]" />}
              >
                {pendingPromotionsCount > 0 ? `Moderar (${pendingPromotionsCount})` : "Ver Promoções"}
              </Button>
            </Link>

            <Link href="/beneficios">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
                leftIcon={<ShieldCheck size={14} className="text-emerald-600" />}
              >
                Gerenciar Catálogo
              </Button>
            </Link>

            <Link href="/oficinas">
              <Button
                variant="outline"
                size="sm"
                className={`w-full justify-start text-xs font-semibold ${
                  pendingWorkshopsCount > 0
                    ? "border-amber-400 bg-amber-50/80 text-amber-950 hover:bg-amber-100 font-bold"
                    : "text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
                leftIcon={
                  <Wrench
                    size={14}
                    className={pendingWorkshopsCount > 0 ? "text-amber-600 animate-pulse" : "text-indigo-600"}
                  />
                }
              >
                {pendingWorkshopsCount > 0
                  ? `Moderar Oficinas (${pendingWorkshopsCount})`
                  : "Credenciar Oficina"}
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConsolidatedReport}
              className="w-full justify-start text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"
              leftIcon={<Download size={14} className="text-slate-600" />}
            >
              Exportar Geral CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
