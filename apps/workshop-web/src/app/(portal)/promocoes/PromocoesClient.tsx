"use client";

import React, { useState, useTransition } from "react";
import { Button, Badge, Clock, CheckCircle2, XCircle, Gift, X } from "@grupo-j/ui-web";
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
  const [imageUrl, setImageUrl] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        const result = await createWorkshopPromotionAction({
          title,
          description,
          imageUrl,
          discountPercentage: discountPercentage ? Number(discountPercentage) : undefined
        });
        if (!result.success) {
          setFeedback({ type: "error", message: result.error || "Falha ao cadastrar a promoção." });
          return;
        }
      } catch (err: unknown) {
        setFeedback({ type: "error", message: err instanceof Error ? err.message : "Falha ao cadastrar a promoção." });
        return;
      }

      const nova: PromotionRow = {
        id: `promo-ws-${Date.now()}`,
        title,
        description,
        image_url: imageUrl || null,
        status: "pending_approval",
        created_at: new Date().toISOString()
      };

      setItems((prev) => [nova, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setDiscountPercentage("");
      setFeedback({
        type: "success",
        message: "Promoção submetida para aprovação com sucesso! Nossa equipe avaliará em até 4 horas."
      });
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
                {p.image_url && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
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
                  Submeta uma promoção com foto para validação do Grupo J antes de publicar.
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

              {/* Seletor de Imagem com Enquadramento 16:9 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto ou Banner da Promoção *
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    Proporção ideal: 16:9 (ex: 800 × 450 px)
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-400 bg-slate-900 group shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview da promoção"
                      className="w-full h-full object-cover"
                    />
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
                          ✕ Remover foto
                        </button>
                      </div>
                      <p className="text-white text-xs font-bold truncate">
                        Visualização idêntica à do aplicativo móvel
                      </p>
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
                    <p className="text-xs font-bold text-slate-700">
                      Clique para escolher imagem do computador
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG ou WEBP (Proporção 16:9 recomendada • máx. 5MB)
                    </p>
                  </div>
                )}

                {/* Modelos rápidos automotivos 16:9 */}
                <div className="mt-2">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Ou selecione um modelo fotográfico em 16:9:
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80")}
                      className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-medium transition text-center truncate"
                    >
                      Oficina Mecânica
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80")}
                      className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-medium transition text-center truncate"
                    >
                      Pneus & Rodas
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80")}
                      className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-medium transition text-center truncate"
                    >
                      Freios & Suspensão
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80")}
                      className="text-[10px] py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-medium transition text-center truncate"
                    >
                      Climatização A/C
                    </button>
                  </div>
                </div>
              </div>

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
