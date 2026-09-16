"use client";

import React, { useState, useTransition } from "react";
import { Button, Badge, Clock, CheckCircle2, Gift, X } from "@grupo-j/ui-web";
import { createWorkshopPromotionAction } from "./actions";
import { formatDate } from "@/lib/format";
import type { PromotionRow } from "@/lib/queries";

interface Props {
  promotions: PromotionRow[];
}

export function PromocoesClient({ promotions }: Props) {
  const [items, setItems] = useState<PromotionRow[]>(promotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    startTransition(async () => {
      try {
        await createWorkshopPromotionAction({ title, description });
      } catch (err: unknown) {
        setFeedback(err instanceof Error ? err.message : "Falha ao cadastrar a promoção.");
        return;
      }

      const nova: PromotionRow = {
        id: `promo-ws-${Date.now()}`,
        title,
        description,
        status: "pending_approval",
        created_at: new Date().toISOString()
      };

      setItems((prev) => [nova, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setFeedback("Promoção submetida para aprovação com sucesso! Nossa equipe avaliará em até 4 horas.");
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Divulgação de Ofertas & Promoções</h1>
          <p className="text-sm text-slate-500 mt-1">
            Crie campanhas e cortesias para atrair motoristas do Grupo J para a sua oficina.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="bg-[#034EFE] font-bold"
          onClick={() => setIsModalOpen(true)}
        >
          + Nova Promoção
        </Button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Gift className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhuma promoção cadastrada ainda</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ofereça descontos em pastilhas, cristalização de vidros ou cortesias para estimular motoristas associados a escolherem sua oficina mecânica.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#034EFE]"
              onClick={() => setIsModalOpen(true)}
            >
              Criar Primeira Promoção
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => {
            const isPendingMod = p.status === "pending_approval";
            const isApproved = p.status === "approved" || p.status === "active";
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Cadastrada em {formatDate(p.created_at)}
                    </span>
                    {isPendingMod && (
                      <Badge variant="warning">Em Moderação</Badge>
                    )}
                    {isApproved && (
                      <Badge variant="success">Ativa no App</Badge>
                    )}
                    {p.status === "rejected" && (
                      <Badge variant="danger">Rejeitada</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-amber-500" />
                    {isApproved ? "Publicada aos motoristas" : "Aguardando equipe Grupo J"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Nova Oferta ou Cortesia</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submeta uma promoção para validação do Grupo J antes de publicar.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título da Oferta
                </label>
                <input
                  type="text"
                  placeholder="Ex: 20% OFF em Troca de Pastilhas Dianteiras"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição & Condições
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes para o motorista, peças incluídas e restrições..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="bg-[#034EFE]"
                >
                  {isPending ? "Submetendo..." : "Submeter para Aprovação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
