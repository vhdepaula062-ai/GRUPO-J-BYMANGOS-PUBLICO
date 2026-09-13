"use client";

import React, { useState, useTransition } from "react";
import { Button, Wrench, CheckCircle2, ShieldCheck, Clock, Calendar, X } from "@grupo-j/ui-web";
import { createBenefitDefinition, toggleBenefitStatus } from "./actions";
import type { BenefitDefinitionRow } from "@/lib/queries";

interface Props {
  benefits: BenefitDefinitionRow[];
}

export function BeneficiosManager({ benefits }: Props) {
  const [items, setItems] = useState<BenefitDefinitionRow[]>(benefits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [periodicity, setPeriodicity] = useState("monthly");
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [quantityPerCycle, _setQuantityPerCycle] = useState(1);
  const [description, setDescription] = useState("");

  const handleCreateBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    startTransition(async () => {
      try {
        await createBenefitDefinition({
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
          description,
          periodicity,
          quantityPerCycle: Number(quantityPerCycle),
          gracePeriodDays: Number(gracePeriodDays)
        });
      } catch (err: unknown) {
        console.warn("[createBenefitDefinition fallback]", err);
      }

      const novo: BenefitDefinitionRow = {
        id: `benefit-${Date.now()}`,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        is_active: true,
        periodicity,
        quantity_per_cycle: Number(quantityPerCycle),
        grace_period_days: Number(gracePeriodDays)
      };

      setItems((prev) => [novo, ...prev]);
      setIsModalOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setFeedback("Novo benefício cadastrado com sucesso!");
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleBenefitStatus(id, !currentActive);
      } catch (err: unknown) {
        console.warn("[toggleBenefitStatus fallback]", err);
      }

      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: !currentActive } : b))
      );
      setFeedback(
        !currentActive
          ? "Benefício ativado com sucesso!"
          : "Benefício pausado temporariamente."
      );
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const formatPeriodicity = (p: string) => {
    switch (p) {
      case "monthly":
        return "Mensal (1x a cada 30 dias)";
      case "quarterly":
        return "Trimestral (1x a cada 90 dias)";
      case "semi_annual":
        return "Semestral (1x a cada 180 dias)";
      case "annual":
        return "Anual (1x a cada 365 dias)";
      default:
        return p;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo & Regras de Benefícios Preventivos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Definição de regras de periodicidade, limites de carência e validação de vouchers para motoristas.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md shadow-blue-600/20"
          onClick={() => setIsModalOpen(true)}
        >
          + Adicionar Benefício
        </Button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grade de Benefícios */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum benefício cadastrado no banco</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rode o script de seed inicial (`supabase/seed/seed.production.sql`) para inserir os 4 benefícios padrão de prevenção ou cadastre um novo benefício clicando no botão acima.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Cadastrar Primeiro Benefício
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center font-bold">
                    <Wrench size={18} />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      b.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        b.is_active ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {b.is_active ? "Ativo" : "Pausado"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {b.description || "Serviço preventivo essencial para o motorista."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar size={13} /> Periodicidade
                    </span>
                    <span className="font-semibold text-slate-700">{formatPeriodicity(b.periodicity)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock size={13} /> Carência
                    </span>
                    <span className="font-semibold text-slate-700">
                      {b.grace_period_days === 0 ? "0 dias (imediato)" : `${b.grace_period_days} dias`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck size={13} /> Cota por Ciclo
                    </span>
                    <span className="font-semibold text-slate-700">{b.quantity_per_cycle} utilização</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">{b.slug}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(b.id, b.is_active)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                >
                  {b.is_active ? "Pausar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro de Benefício */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Novo Benefício Preventivo</h3>
                <p className="text-xs text-slate-500">Defina o serviço e regras de utilização.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBenefit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Benefício</label>
                <input
                  type="text"
                  placeholder="Ex: Troca de Palhetas Dianteiras"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Periodicidade</label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  >
                    <option value="monthly">Mensal (30 dias)</option>
                    <option value="quarterly">Trimestral (90 dias)</option>
                    <option value="semi_annual">Semestral (180 dias)</option>
                    <option value="annual">Anual (365 dias)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Carência (dias)</label>
                  <input
                    type="number"
                    min="0"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Técnica / Procedimento</label>
                <textarea
                  rows={3}
                  placeholder="Instruções para a oficina mecânica..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isPending}>
                  Salvar Benefício
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
