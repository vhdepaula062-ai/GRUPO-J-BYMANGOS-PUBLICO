"use client";

import React, { useState, useTransition } from "react";
import { Badge, Button, CheckCircle2, XCircle, Clock, Tag, X, Plus, Trash2, Pencil, Calendar } from "@grupo-j/ui-web";
import { createNetworkPromotion, updatePromotionStatus, updatePromotion, deletePromotion } from "./actions";
import { formatDateTime } from "@/lib/format";
import type { PromotionRow, WorkshopRow } from "@/lib/queries";

interface Props {
  promotions: PromotionRow[];
  workshops?: WorkshopRow[];
}

type ModalMode = "create" | "edit" | null;

const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_END = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
})();

export function PromocoesModerator({ promotions: initialPromos, workshops = [] }: Props) {
  const [promos, setPromos] = useState<PromotionRow[]>(initialPromos);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form fields
  const [newTitle, setNewTitle] = useState("");
  const [newWorkshop, setNewWorkshop] = useState("Rede Credenciada Geral");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDiscount, setNewDiscount] = useState<number | "">("");
  const [newStartDate, setNewStartDate] = useState(TODAY);
  const [newEndDate, setNewEndDate] = useState(DEFAULT_END);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") setNewImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const openCreate = () => {
    setEditingId(null);
    setNewTitle("");
    setNewWorkshop("Rede Credenciada Geral");
    setNewDescription("");
    setNewImageUrl("");
    setNewDiscount("");
    setNewStartDate(TODAY);
    setNewEndDate(DEFAULT_END);
    setModalMode("create");
  };

  const openEdit = (promo: PromotionRow) => {
    setEditingId(promo.id);
    setNewTitle(promo.title);
    setNewWorkshop(promo.workshop?.trade_name ?? "Rede Credenciada Geral");
    setNewDescription(promo.description);
    setNewImageUrl(promo.image_url ?? "");
    setNewDiscount(promo.discount_percentage ?? "");
    setNewStartDate(promo.start_date ?? TODAY);
    setNewEndDate(promo.end_date ?? DEFAULT_END);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  // ---------------------------------------------------------------------------
  // Ações
  // ---------------------------------------------------------------------------

  const handleModerate = (id: string, newStatus: "approved" | "rejected") => {
    startTransition(async () => {
      const result = await updatePromotionStatus(id, newStatus);
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao moderar.");
        return;
      }
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus === "approved" ? "active" : "rejected" } : p))
      );
      showFeedback("success", newStatus === "approved" ? "Promoção aprovada e publicada!" : "Promoção rejeitada.");
    });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;
    startTransition(async () => {
      const result = await createNetworkPromotion({
        title: newTitle,
        description: newDescription,
        workshopName: newWorkshop,
        imageUrl: newImageUrl || undefined,
        discountPercentage: newDiscount ? Number(newDiscount) : undefined,
        startDate: newStartDate,
        endDate: newEndDate
      });
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao publicar.");
        return;
      }
      const created: PromotionRow = {
        id: result.promotion?.id || `promo-admin-${Date.now()}`,
        title: newTitle,
        description: newDescription,
        image_url: newImageUrl || null,
        status: "active",
        created_at: new Date().toISOString(),
        start_date: newStartDate,
        end_date: newEndDate,
        discount_percentage: newDiscount ? Number(newDiscount) : null,
        workshop: { trade_name: newWorkshop || "Rede Credenciada Geral" }
      };
      setPromos((prev) => [created, ...prev]);
      closeModal();
      showFeedback("success", "Campanha criada e publicada com sucesso!");
    });
  };

  const handleEditPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !newTitle || !newDescription) return;
    startTransition(async () => {
      const result = await updatePromotion(editingId, {
        title: newTitle,
        description: newDescription,
        imageUrl: newImageUrl || null,
        discountPercentage: newDiscount ? Number(newDiscount) : null,
        startDate: newStartDate,
        endDate: newEndDate
      });
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao editar.");
        return;
      }
      setPromos((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: newTitle,
                description: newDescription,
                image_url: newImageUrl || null,
                discount_percentage: newDiscount ? Number(newDiscount) : null,
                start_date: newStartDate,
                end_date: newEndDate
              }
            : p
        )
      );
      closeModal();
      showFeedback("success", "Promoção atualizada com sucesso!");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deletePromotion(id);
      if (!result.success) {
        showFeedback("error", result.error || "Falha ao remover.");
        setConfirmDeleteId(null);
        return;
      }
      setPromos((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
      showFeedback("success", "Promoção removida permanentemente.");
    });
  };

  const pendingCount = promos.filter((p) => p.status === "pending_approval").length;
  const approvedCount = promos.filter((p) => p.status === "approved" || p.status === "active").length;
  const rejectedCount = promos.filter((p) => p.status === "rejected").length;

  const isExpired = (endDate?: string | null) => {
    if (!endDate) return false;
    return endDate < TODAY;
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curadoria & Moderação de Ofertas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aprove promoções das oficinas ou crie campanhas da rede Grupo J com agendamento de prazo.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreate}
          className="bg-[#034EFE] font-bold shadow-sm shadow-blue-600/20"
          leftIcon={<Plus size={16} />}
        >
          + Criar Promoção da Rede
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

      {/* Métricas */}
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

      {/* Lista */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Tag className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhuma promoção submetida ainda</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quando as oficinas credenciadas cadastrarem ofertas, elas aparecerão aqui para curadoria.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Todas as Ofertas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map((promo) => {
              const isPendingStatus = promo.status === "pending_approval";
              const expired = isExpired(promo.end_date);
              const isSuspended = promo.status === "suspended";

              return (
                <div
                  key={promo.id}
                  className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors ${
                    expired ? "border-rose-200/80 opacity-70" : "border-slate-200/80"
                  }`}
                >
                  {promo.image_url && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
                      <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                      {expired && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-rose-600 px-3 py-1 rounded-full">
                            ⏰ Prazo Expirado
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {promo.workshop?.trade_name ?? "Rede Grupo J"}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {expired && <Badge variant="danger">Expirada</Badge>}
                        {isSuspended && <Badge variant="warning">Suspensa</Badge>}
                        {!expired && !isSuspended && promo.status === "pending_approval" && (
                          <Badge variant="warning">Aguardando Aprovação</Badge>
                        )}
                        {!expired && !isSuspended && (promo.status === "approved" || promo.status === "active") && (
                          <Badge variant="success">Ativa</Badge>
                        )}
                        {promo.status === "rejected" && <Badge variant="danger">Rejeitada</Badge>}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">{promo.title}</h3>
                    {promo.discount_percentage && (
                      <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {promo.discount_percentage}% OFF
                      </span>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{promo.description}</p>

                    {/* Datas de agendamento */}
                    {(promo.start_date || promo.end_date) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          Início: <strong className="text-slate-600">{promo.start_date ?? "—"}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Fim: <strong className={expired ? "text-rose-600" : "text-slate-600"}>{promo.end_date ?? "—"}</strong>
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Submetida em: {formatDateTime(promo.created_at)}
                    </p>
                  </div>

                  {/* Ações do card */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Moderação para pendentes */}
                    {isPendingStatus && !expired && (
                      <div className="flex items-center gap-2">
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
                          Aprovar
                        </Button>
                      </div>
                    )}
                    {!isPendingStatus && <div />}

                    {/* Editar / Excluir */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {confirmDeleteId === promo.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                          <span className="text-[11px] text-rose-700 font-semibold">Confirmar?</span>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDelete(promo.id)}
                            className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded-lg transition"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-1"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(promo)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                            title="Editar promoção"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(promo.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Remover promoção"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Criar / Editar */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95 duration-200 my-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {modalMode === "create" ? "Nova Campanha da Rede" : "Editar Promoção"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalMode === "create"
                    ? "Publique ofertas diretamente no app dos motoristas."
                    : "Atualize os dados desta promoção. A mudança será imediata."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={modalMode === "create" ? handleCreatePromo : handleEditPromo} className="space-y-4">
              {/* Título */}
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

              {/* Oficina + Desconto */}
              <div className="grid grid-cols-2 gap-3">
                {modalMode === "create" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Oficina / Abrangência
                    </label>
                    <input
                      type="text"
                      list="workshops-list"
                      placeholder="Rede Credenciada Geral"
                      value={newWorkshop}
                      onChange={(e) => setNewWorkshop(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                    />
                    <datalist id="workshops-list">
                      <option value="Rede Credenciada Geral">Rede Credenciada Geral (Toda a Rede)</option>
                      {workshops.map((w) => (
                        <option key={w.id} value={w.trade_name}>
                          {w.trade_name} {w.city ? `(${w.city})` : ""}
                        </option>
                      ))}
                    </datalist>
                  </div>
                )}
                <div className={modalMode === "edit" ? "col-span-2" : ""}>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Ex: 30"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>

              {/* Datas de agendamento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar size={12} /> Data de Início
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock size={12} /> Data de Encerramento
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    min={newStartDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 -mt-2">
                ⏰ Após o encerramento, a promoção será removida automaticamente do aplicativo.
              </p>

              {/* Imagem */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto ou Banner *
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">Proporção ideal: 16:9</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {newImageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 group shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow">
                          ✓ Enquadramento 16:9 Seguro
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewImageUrl("")}
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
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG ou WEBP • proporção 16:9 recomendada</p>
                  </div>
                )}

                {/* Templates rápidos */}
                <div className="mt-2">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Ou selecione um modelo 16:9:</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "Oficina Rede", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80" },
                      { label: "Pneus & Rodas", url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80" },
                      { label: "Freios", url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80" },
                      { label: "Ar-Condicionado", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80" }
                    ].map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setNewImageUrl(t.url)}
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
                  Regras e Condições *
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva as condições da promoção para os motoristas..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="bg-[#034EFE] font-bold"
                >
                  {isPending
                    ? "Salvando..."
                    : modalMode === "create"
                    ? "Publicar Campanha"
                    : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
