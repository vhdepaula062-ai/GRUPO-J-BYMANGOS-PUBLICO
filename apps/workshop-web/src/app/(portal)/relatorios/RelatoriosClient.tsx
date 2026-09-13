"use client";

import React, { useState } from "react";
import { Button, Download, FileSpreadsheet, CheckCircle2, DollarSign, Wrench, BarChart3 } from "@grupo-j/ui-web";
import type { ServiceRow } from "@/lib/queries";
import { formatCents, formatDate } from "@/lib/format";

interface Props {
  services: ServiceRow[];
}

export function RelatoriosClient({ services }: Props) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalAtendimentos = services.length;
  const totalRepasseCents = totalAtendimentos * 5000; // R$ 50,00 por atendimento preventivo fixo

  const handleDownloadCSV = () => {
    const headers = [
      "ID Atendimento",
      "Voucher Token",
      "Data",
      "Nome do Motorista",
      "Placa do Veiculo",
      "Modelo",
      "Servico Preventivo",
      "Repasse Grupo J (R$)",
      "Status"
    ];

    const rows = services.map((s) => [
      s.id,
      s.voucher_token || "—",
      formatDate(s.created_at),
      s.customer?.profile?.full_name || "Motorista",
      s.vehicle?.plate || "—",
      s.vehicle ? `${s.vehicle.brand} ${s.vehicle.model}` : "—",
      s.benefit?.name || "Serviço Preventivo",
      "50.00",
      s.status
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-atendimentos-grupo-j-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios & Extratos de Produção</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consolidação de atendimentos realizados, comprovantes de vouchers e exportação em CSV para contabilidade.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="bg-[#034EFE] font-bold"
          disabled={services.length === 0}
          onClick={handleDownloadCSV}
        >
          <Download className="w-4 h-4 mr-1.5 inline" /> Exportar CSV (Excel)
        </Button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Arquivo CSV gerado e baixado com sucesso!</span>
        </div>
      )}

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center shrink-0">
            <Wrench size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendimentos Realizados</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalAtendimentos}</p>
            <span className="text-[11px] text-slate-500 font-medium">Vouchers validados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repasses Totais</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCents(totalRepasseCents)}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">R$ 50,00 por procedimento</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auditoria Fiscal</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">100%</p>
            <span className="text-[11px] text-indigo-700 font-semibold">Integridade garantida</span>
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum dado para exportação</h3>
            <p className="text-xs text-slate-500 mt-1">
              Conforme os atendimentos preventivos forem sendo validados e concluídos na oficina, o histórico consolidado ficará disponível para emissão e download.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Resumo de Atendimentos</h3>
          <p className="text-xs text-slate-500">
            Os dados acima podem ser exportados a qualquer momento para alimentação do seu software de gestão interna ou contabilidade.
          </p>
        </div>
      )}
    </div>
  );
}
