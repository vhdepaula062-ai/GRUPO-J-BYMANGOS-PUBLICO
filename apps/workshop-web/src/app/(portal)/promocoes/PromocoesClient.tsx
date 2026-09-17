"use client";

import React, { useState, useTransition } from "react";
import { Button, Badge, Clock, CheckCircle2, XCircle, Gift, X, Trash2, PauseCircle, PlayCircle, Calendar } from "@grupo-j/ui-web";
import {
  createWorkshopPromotionAction,
  deleteWorkshopPromotion,
  suspendWorkshopPromotion,
  reactivateWorkshopPromotion
} from "./actions";
import { formatDate } from "@/lib/format";
import type { PromotionRow } from "@/lib/queries";

interface Props {
  promotions: PromotionRow[];
}

const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_END = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
})();

export function PromocoesClient({ promotions }: Props) {
  const [items, setItems] = useState<PromotionRow[]>(promotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [startDate, setStartDate] = useState(TODAY);
  const [endDate, setEndDate] = useState(DEFAULT_END);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setImageUrl("");
    setDiscountPercentage(""); setStartDate(TODAY); setEndDate(DEFAULT_END);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const result = await createWorkshopPromotionAction({
        title,
        description,
        imageUrl: imageUrl || undefined,
        discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
        startDate,
        endDate
      });

      if (!result.success) {
        showFeedback("error", result.error || "Falha ao cadastrar a promoção.");
        return;
      }

      const nova: PromotionRow = {
        id: `promo-ws-${Date.now()}`,
        title,
        description,
        image_url: imageUrl || null,
        status: "pending_approval",
        created_at: new Date().toISOString(),
        start_date: startDate,
        end_date: endDate,
        discount_percentage: discountPercentage ? Number(discountPercentage) : null
      };

      setItems((prev) => [nova, ...prev]);
      setIsModalOpen(false);
      resetForm();
      showFeedback("success", "Promoção submetida para aprovação! Nossa equipe avaliará em até 4 horas.");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteWorkshopPromotion(id);
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao remover.");
        setConfirmDeleteId(null);
        return;
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
      showFeedback("success", "Promoção removida.");
    });
  };

  const handleSuspend = (id: string) => {
    startTransition(async () => {
      const result = await suspendWorkshopPromotion(id);
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao suspender.");
        return;
      }
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "suspended" } : p)));
      showFeedback("success", "Promoção suspensa. Ela não aparecerá mais no app dos motoristas.");
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      const result = await reactivateWorkshopPromotion(id);
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao reativar.");
        return;
      }
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: "pending_approval" } : p)));
      showFeedback("success", "Promoção reativada e enviada para reaprovação.");
    });
  };

  const isExpired = (endDate?: string | null) => {
    if (!endDate) return false;
    return endDate < TODAY;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Divulgação de Ofertas & Promoções</h1>
          <p className="text-sm text-slate-500 mt-1">
            Crie campanhas e cortesias para atrair motoristas do Grupo J. Defina o prazo de validade para expiração automática.
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

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            feedback.type === "error"
              ? "bg-rose-50 border border-rose-200 text-rose-800"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          {feedback.type === "error" ? (
            <XCircle size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Gift className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhuma promoção cadastrada ainda</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ofereça descontos em pastilhas, cristalização de vidros ou cortesias para estimular motoristas a escolherem sua oficina.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" className="bg-[#034EFE]" onClick={() => setIsModalOpen(true)}>
              Criar Primeira Promoção
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => {
            const isPendingMod = p.status === "pending_approval";
            const isApproved = p.status === "approved" || p.status === "active";
            const isSuspended = p.status === "suspended";
            const expired = isExpired(p.end_date);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  expired || isSuspended ? "border-slate-200/60 opacity-75" : "border-slate-200/80"
                }`}
              >
                {/* Imagem */}
                {p.image_url && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    {(expired || isSuspended) && (
                      <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-slate-700 px-3 py-1 rounded-full">
                          {expired ? "⏰ Expirada" : "⏸ Suspensa"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2.5">
                  {/* Status badges */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span className="text-xs text-slate-400">
                      Criada em {formatDate(p.created_at)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {expired && <Badge variant="danger">Expirada</Badge>}
                      {!expired && isSuspended && <Badge variant="warning">Suspensa</Badge>}
                      {!expired && !isSuspended && isPendingMod && <Badge variant="warning">Em Moderação</Badge>}
                      {!expired && !isSuspended && isApproved && <Badge variant="success">Ativa no App</Badge>}
                      {p.status === "rejected" && <Badge variant="danger">Rejeitada</Badge>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.title}</h3>
                    {p.discount_percentage && (
                      <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1">
                        {p.discount_percentage}% OFF
                      </span>
                    )}
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>
                  </div>

                  {/* Datas */}
                  {(p.start_date || p.end_date) && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      {p.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <strong className="text-slate-600">{p.start_date}</strong>
                        </span>
                      )}
                      {p.end_date && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          <strong className={expired ? "text-rose-600" : "text-slate-600"}>{p.end_date}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Suspender / Reativar (só para ativas/aprovadas/suspensas) */}
                    {!expired && isApproved && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSuspend(p.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition"
                        title="Suspender promoção"
                      >
                        <PauseCircle size={13} /> Suspender
                      </button>
                    )}
                    {isSuspended && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReactivate(p.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                        title="Reativar promoção"
                      >
                        <PlayCircle size={13} /> Reativar
                      </button>
                    )}
                    {!expired && isPendingMod && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-700">
                        <Clock size={12} /> Aguardando equipe Grupo J
                      </span>
                    )}
                  </div>

                  {/* Excluir */}
                  {confirmDeleteId === p.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                      <span className="text-[11px] text-rose-700 font-semibold">Excluir?</span>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(p.id)}
                        className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded-lg transition"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 px-1"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Excluir promoção"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95 duration-200 my-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Nova Oferta ou Cortesia</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submeta uma promoção com foto para validação do Grupo J antes de publicar.
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título da Oferta *
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

              {/* Desconto + Enquadramento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Ex: 20"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enquadramento
                  </label>
                  <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                    ✓ Proporção 16:9 (Mobile)
                  </div>
                </div>
              </div>

              {/* Agendamento de datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={12} /> Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock size={12} /> Data de Encerramento
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 -mt-2">
                ⏰ Após o encerramento, a promoção expira automaticamente no app.
              </p>

              {/* Imagem */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto ou Banner da Promoção *
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">Proporção 16:9</span>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                {imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 group shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow">
                          ✓ Enquadramento 16:9 Seguro
                        </span>
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-semibold transition shadow"
                        >
                          ✕ Remover
                        </button>
                      </div>
                      <p className="text-white text-xs font-bold truncate">Visualização idêntica ao app móvel</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#034EFE] bg-slate-50 hover:bg-blue-50/40 cursor-pointer flex flex-col items-center justify-center p-4 transition text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100/70 text-[#034EFE] flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
                      📷
                    </div>
                    <p className="text-xs font-bold text-slate-700">Clique para escolher imagem</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG ou WEBP • 16:9 recomendado • máx. 5MB</p>
                  </div>
                )}

                {/* Templates rápidos */}
                <div className="mt-2">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Ou selecione um modelo 16:9:</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Oficina", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80" },
                      { label: "Pneus", url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80" },
                      { label: "Freios", url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80" },
                      { label: "Climatização", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80" }
                    ].map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setImageUrl(t.url)}
                        className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-medium transition text-center truncate"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição & Condições *
                </label>
                <textarea
                  rows={2}
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
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
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
