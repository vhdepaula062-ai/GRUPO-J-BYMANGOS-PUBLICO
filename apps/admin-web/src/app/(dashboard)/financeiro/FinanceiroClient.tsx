"use client";

import React from "react";
import {
  Badge,
  Button,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Download
} from "@grupo-j/ui-web";
import type { TransactionRow } from "@/lib/queries";
import { formatCents, formatDateTime, statusLabel } from "@/lib/format";
import { exportToCsv } from "@/lib/exportCsv";

interface Props {
  transactions: TransactionRow[];
  totalRecebidoCents: number;
  totalRepassesCents: number;
  saldoLiquidoCents: number;
}

export function FinanceiroClient({
  transactions,
  totalRecebidoCents,
  totalRepassesCents,
  saldoLiquidoCents
}: Props) {
  const handleExportCsv = () => {
    exportToCsv(
      "fluxo_financeiro_grupo_j",
      [
        { key: "created_at", header: "Data/Hora", format: (v) => formatDateTime(v) },
        { key: "description", header: "Descrição", format: (v) => v || "Transação" },
        { key: "reference_id", header: "ID de Referência", format: (v, item) => v || item.id },
        { key: "type", header: "Tipo", format: (v) => String(v).replace(/_/g, " ") },
        {
          key: "amount_cents",
          header: "Valor (R$)",
          format: (v) => {
            const num = (v || 0) / 100;
            return num.toFixed(2).replace(".", ",");
          }
        },
        { key: "status", header: "Status", format: (v) => statusLabel(v).label }
      ],
      transactions
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fluxo Financeiro & Liquidações</h1>
          <p className="text-sm text-slate-500 mt-1">
            Conciliação de assinaturas de motoristas, mensalidades B2B e repasses automáticos para oficinas.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download size={14} />}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Financeiras Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entradas Liquidadas</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCents(totalRecebidoCents)}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">Assinaturas e Mensalidades</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repasses a Oficinas</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCents(totalRepassesCents)}</p>
            <span className="text-[11px] text-rose-700 font-semibold">Vouchers preventivos executados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Líquido Grupo J</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{formatCents(saldoLiquidoCents)}</p>
            <span className="text-[11px] text-blue-700 font-semibold">Margem operacional retida</span>
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Extrato Consolidado</h2>
          <span className="text-xs font-semibold text-slate-500">
            {transactions.length} {transactions.length === 1 ? "movimentação" : "movimentações"}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Nenhuma movimentação financeira registrada</h3>
              <p className="text-xs text-slate-500 mt-1">
                Todas as cobranças processadas via gateway PagSeguro e repasses efetuados às oficinas aparecerão com hash auditável nesta tabela.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Data / Hora</th>
                    <th className="px-6 py-3">Descrição / Referência</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const badge = statusLabel(tx.status);
                    const isPositive = tx.amount_cents >= 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {formatDateTime(tx.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{tx.description || "Transação"}</p>
                          <p className="text-xs text-slate-400 font-mono">{tx.reference_id || tx.id}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                          {tx.type.replace(/_/g, " ")}
                        </td>
                        <td className={`px-6 py-4 font-bold ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {isPositive ? `+ ${formatCents(tx.amount_cents)}` : `- ${formatCents(Math.abs(tx.amount_cents))}`}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
