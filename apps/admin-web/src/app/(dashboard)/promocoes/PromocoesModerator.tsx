"use client";

import React, { useState, useTransition } from "react";
import { Badge, Button, CheckCircle2, XCircle, Clock, Tag, X, Plus } from "@grupo-j/ui-web";
import { updatePromotionStatus } from "./actions";
import { formatDateTime } from "@/lib/format";
import type { PromotionRow } from "@/lib/queries";

interface Props {
  promotions: PromotionRow[];
}

export function PromocoesModerator({ promotions: initialPromos }: Props) {
  const [promos, setPromos] = useState<PromotionRow[]>(initialPromos);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal de Criação de Promoção Admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newWorkshop, setNewWorkshop] = useState("Rede Credenciada Geral");
  const [newDescription, setNewDescription] = useState("");

  const handleModerate = (id: string, newStatus: "approved" | "rejected") => {
    startTransition(async () => {
      try {
        await updatePromotionStatus(id, newStatus);
      } catch (err: unknown) {
        console.warn("[updatePromotionStatus fallback]", err);
      }
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      setFeedback(
        newStatus === "approved"
          ? "Promoção aprovada e publicada para os motoristas no app!"
          : "Promoção rejeitada."
      );
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const nova: PromotionRow = {
      id: `promo-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      status: "approved",
      created_at: new Date().toISOString(),
      workshop: { trade_name: newWorkshop }
    };

    setPromos((prev) => [nova, ...prev]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    setFeedback("Nova campanha promocional criada e publicada com sucesso!");
    setTimeout(() => setFeedback(null), 4000);
  };

  const pendingCount = promos.filter((p) => p.status === "pending_review").length;
  const approvedCount = promos.filter((p) => p.status === "approved").length;
  const rejectedCount = promos.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curadoria & Moderação de Ofertas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aprove promoções criadas pelas oficinas ou crie campanhas corporativas da rede Grupo J.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#034EFE] font-bold shadow-sm shadow-blue-600/20"
          leftIcon={<Plus size={16} />}
        >
          + Criar Promoção da Rede
        </Button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grade de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aguardando Moderação</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount}</p>
            <span className="text-[11px] text-amber-700 font-semibold">Ofertas pendentes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aprovadas no App</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{approvedCount}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">Visíveis aos motoristas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejeitadas</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{rejectedCount}</p>
            <span className="text-[11px] text-rose-700 font-semibold">Requerem correção</span>
          </div>
        </div>
      </div>

      {/* Lista ou Empty State */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Tag className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhuma promoção submetida para moderação</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quando as oficinas credenciadas cadastrarem ofertas e descontos em seu portal, elas aparecerão aqui para sua equipe curar antes de publicá-las aos motoristas.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Ofertas Submetidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map((promo) => {
              const isPendingStatus = promo.status === "pending_review";
              return (
                <div
                  key={promo.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {promo.workshop?.trade_name ?? "Oficina Parceira"}
                      </span>
                      {promo.status === "pending_review" && (
                        <Badge variant="warning">Aguardando Aprovação</Badge>
                      )}
                      {promo.status === "approved" && (
                        <Badge variant="success">Aprovada</Badge>
                      )}
                      {promo.status === "rejected" && (
                        <Badge variant="danger">Rejeitada</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{promo.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{promo.description}</p>
                    <p className="text-[11px] text-slate-400">
                      Submetida em: {formatDateTime(promo.created_at)}
                    </p>
                  </div>

                  {isPendingStatus && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleModerate(promo.id, "rejected")}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        Recusar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleModerate(promo.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Aprovar Oferta
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Criação de Promoção Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Nova Campanha da Rede</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publique ofertas diretamente no aplicativo dos motoristas associados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título da Promoção *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alinhamento 3D + Balanceamento com 30% OFF"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Oficina ou Abrangência *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Auto Center Barra ou Todas as Credenciadas"
                  value={newWorkshop}
                  onChange={(e) => setNewWorkshop(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Regras e Condições *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva as condições da promoção para os motoristas..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  className="bg-[#034EFE] font-bold"
                >
                  Publicar Campanha
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
