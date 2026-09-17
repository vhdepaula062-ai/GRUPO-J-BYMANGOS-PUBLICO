"use client";

import React, { useState, useTransition } from "react";
import {
  StatusBadge,
  Button,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  RefreshCw,
  X,
  Download,
  Trash2,
  Modal
} from "@grupo-j/ui-web";
import { formatDate } from "@/lib/format";
import { exportToCsv } from "@/lib/exportCsv";
import {
  moderateWorkshopAction,
  createDirectWorkshopAction,
  decommissionWorkshopAction,
  getAssignedMotoristasCount,
  type DirectWorkshopData
} from "./actions";
import type { WorkshopRow } from "@/lib/queries";

export interface OficinasModeratorProps {
  initialWorkshops: WorkshopRow[];
}

export function OficinasModerator({ initialWorkshops }: OficinasModeratorProps) {
  const [workshops, setWorkshops] = useState<WorkshopRow[]>(initialWorkshops);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "all">(
    initialWorkshops.some((w) => w.status === "pending_approval") ? "pending" : "active"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Descredenciamento & Realocação de motoristas
  const [decommissioningWorkshop, setDecommissioningWorkshop] = useState<WorkshopRow | null>(null);
  const [assignedMotoristasCount, setAssignedMotoristasCount] = useState<number>(0);
  const [fallbackWorkshopId, setFallbackWorkshopId] = useState<string>("");
  const [deletePermanently, setDeletePermanently] = useState(false);
  const [isDecommissioning, setIsDecommissioning] = useState(false);

  // Modal para cadastro direto pelo admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState<DirectWorkshopData>({
    tradeName: "",
    legalName: "",
    cnpj: "",
    email: "",
    phone: "",
    city: "",
    state: ""
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Filtros
  const pendingWorkshops = workshops.filter((w) => w.status === "pending_approval");
  const activeWorkshops = workshops.filter((w) => w.status === "active");

  const filteredWorkshops = workshops.filter((w) => {
    // Filtro da aba
    if (activeTab === "pending" && w.status !== "pending_approval") return false;
    if (activeTab === "active" && w.status !== "active") return false;

    // Filtro de busca
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.trade_name?.toLowerCase().includes(term) ||
      w.legal_name?.toLowerCase().includes(term) ||
      w.email?.toLowerCase().includes(term) ||
      w.cnpj_masked?.toLowerCase().includes(term) ||
      w.city?.toLowerCase().includes(term)
    );
  });

  // Ação de aprovar
  const handleApprove = (workshop: WorkshopRow) => {
    setProcessingId(workshop.id);
    startTransition(async () => {
      // Atualização otimista imediata
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === workshop.id ? { ...item, status: "active" } : item
        )
      );

      const res = await moderateWorkshopAction(workshop.id, "active");
      setProcessingId(null);

      if (res.success) {
        setFeedback({
          type: "success",
          text: `🎉 Proposta aprovada! A oficina "${workshop.trade_name}" agora está credenciada e ativa na rede Grupo J.`
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Erro ao aprovar proposta. Tente novamente."
        });
      }

      setTimeout(() => setFeedback(null), 7000);
    });
  };

  // Ação de recusar / desativar
  const handleReject = (workshop: WorkshopRow) => {
    if (!confirm(`Deseja recusar a solicitação de credenciamento de "${workshop.trade_name}"?`)) {
      return;
    }

    setProcessingId(workshop.id);
    startTransition(async () => {
      // Atualização otimista
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === workshop.id ? { ...item, status: "inactive" } : item
        )
      );

      const res = await moderateWorkshopAction(workshop.id, "inactive");
      setProcessingId(null);

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Proposta de "${workshop.trade_name}" foi recusada/arquivada.`
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Erro ao recusar oficina."
        });
      }

      setTimeout(() => setFeedback(null), 6000);
    });
  };

  // Ação de suspender / reativar na lista de ativas
  const handleToggleStatus = (workshop: WorkshopRow) => {
    const nextStatus = workshop.status === "active" ? "suspended" : "active";
    const actionLabel = nextStatus === "suspended" ? "suspender" : "reativar";

    if (!confirm(`Deseja ${actionLabel} a oficina "${workshop.trade_name}"?`)) {
      return;
    }

    setProcessingId(workshop.id);
    startTransition(async () => {
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === workshop.id ? { ...item, status: nextStatus } : item
        )
      );

      const res = await moderateWorkshopAction(workshop.id, nextStatus);
      setProcessingId(null);

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Oficina "${workshop.trade_name}" ${nextStatus === "active" ? "reativada" : "suspensa"} com sucesso.`
        });
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Não foi possível alterar o status da oficina."
        });
      }
      setTimeout(() => setFeedback(null), 5000);
    });
  };

  // Abertura do modal de descredenciamento com checagem de motoristas vinculados
  const handleOpenDecommission = async (workshop: WorkshopRow) => {
    setDecommissioningWorkshop(workshop);
    setFallbackWorkshopId("");
    setDeletePermanently(false);
    try {
      const count = await getAssignedMotoristasCount(workshop.id);
      setAssignedMotoristasCount(count);
    } catch {
      setAssignedMotoristasCount(0);
    }
  };

  // Confirmação do descredenciamento e transição de motoristas
  const handleConfirmDecommission = async () => {
    if (!decommissioningWorkshop) return;
    setIsDecommissioning(true);
    try {
      const res = await decommissionWorkshopAction({
        workshopId: decommissioningWorkshop.id,
        fallbackWorkshopId: fallbackWorkshopId || undefined,
        deletePermanently
      });
      if (res.success) {
        setWorkshops((prev) =>
          deletePermanently
            ? prev.filter((w) => w.id !== decommissioningWorkshop.id)
            : prev.map((w) => (w.id === decommissioningWorkshop.id ? { ...w, status: "inactive" } : w))
        );
        setFeedback({
          type: "success",
          text: `Oficina "${decommissioningWorkshop.trade_name}" descredenciada com sucesso.`
        });
        setDecommissioningWorkshop(null);
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Falha ao descredenciar oficina."
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Erro inesperado ao descredenciar oficina."
      });
    } finally {
      setIsDecommissioning(false);
    }
  };

  // Exportar lista de oficinas em CSV formatado
  const handleExportCsv = () => {
    exportToCsv(
      "oficinas_parceiras_grupo_j",
      [
        { key: "trade_name", header: "Nome Fantasia" },
        { key: "legal_name", header: "Razão Social", format: (v) => v || "—" },
        { key: "cnpj_masked", header: "CNPJ", format: (v) => v || "—" },
        { key: "email", header: "E-mail" },
        { key: "phone", header: "Telefone", format: (v) => v || "—" },
        { key: "city", header: "Cidade", format: (v, item) => `${v || "—"}/${item.state || "—"}` },
        {
          key: "status",
          header: "Status",
          format: (v) =>
            v === "active"
              ? "Ativa"
              : v === "pending_approval"
              ? "Aguardando Aprovação"
              : v === "suspended"
              ? "Suspensa"
              : "Inativa"
        },
        { key: "created_at", header: "Cadastrada em", format: (v) => formatDate(v) }
      ],
      workshops
    );
  };

  // Cadastro direto pelo Admin
  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.tradeName.trim() || !modalForm.cnpj.trim() || !modalForm.email.trim()) {
      setModalError("Por favor, preencha Nome Fantasia, CNPJ e E-mail.");
      return;
    }

    setModalLoading(true);
    setModalError(null);

    const res = await createDirectWorkshopAction(modalForm);
    setModalLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      setModalForm({
        tradeName: "",
        legalName: "",
        cnpj: "",
        email: "",
        phone: "",
        city: "",
        state: ""
      });

      setFeedback({
        type: "success",
        text: `Oficina "${modalForm.tradeName}" credenciada e ativada diretamente na rede com sucesso!`
      });

      // Recarrega lista ou inclui otimista
      if (res.workshop) {
        const newW: WorkshopRow = {
          id: (res.workshop.id as string) || String(Date.now()),
          trade_name: modalForm.tradeName,
          legal_name: modalForm.legalName || modalForm.tradeName,
          cnpj_masked: modalForm.cnpj,
          email: modalForm.email,
          phone: modalForm.phone,
          status: "active",
          created_at: new Date().toISOString(),
          city: modalForm.city,
          state: modalForm.state
        };
        setWorkshops((prev) => [newW, ...prev]);
        setActiveTab("active");
      }
      setTimeout(() => setFeedback(null), 7000);
    } else {
      setModalError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Barra de Ações Superiores & Navegação por Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Abas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Clock size={14} />
            <span>Aguardando Aprovação</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "pending"
                  ? "bg-white text-amber-600"
                  : pendingWorkshops.length > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {pendingWorkshops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "active"
                ? "bg-[#034EFE] text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Building2 size={14} />
            <span>Oficinas Ativas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "active"
                  ? "bg-white text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeWorkshops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Todas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "all"
                  ? "bg-white text-slate-900"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {workshops.length}
            </span>
          </button>
        </div>

        {/* Botões de Ação Superior */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download size={14} />}
          >
            Exportar CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={15} />}
            className="bg-[#034EFE] hover:bg-blue-600 text-white shadow-md shadow-blue-600/20"
          >
            + Credenciar Diretamente
          </Button>
        </div>
      </div>

      {/* Caixa de Busca Rápida */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar oficina por nome fantasia, CNPJ, e-mail ou cidade..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 focus:border-[#034EFE] transition-all shadow-sm"
        />
      </div>

      {/* SEÇÃO: AGUARDANDO APROVAÇÃO (Foco do Joaquim) */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Painel de Moderação de Cadastros de Parceiros
                </h4>
                <p className="text-xs text-amber-800">
                  Todas as solicitações de oficinas que se cadastram pelo portal público passam pelo seu crivo aqui antes de ingressarem na rede.
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-amber-200/80 rounded-full text-amber-900">
              {pendingWorkshops.length} pendente{pendingWorkshops.length === 1 ? "" : "s"}
            </span>
          </div>

          {filteredWorkshops.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Nenhuma solicitação pendente no momento!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Todas as oficinas foram analisadas. Novos cadastros feitos em{" "}
                <span className="font-mono text-slate-700">/seja-parceiro</span> aparecerão imediatamente aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 hover:border-amber-400 p-5 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Dados da Oficina */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        {workshop.trade_name}
                      </span>
                      <StatusBadge status={workshop.status} size="sm" />
                      <span className="text-[11px] text-slate-400">
                        Enviado em: {formatDate(workshop.created_at)}
                      </span>
                    </div>

                    {workshop.legal_name && (
                      <p className="text-xs text-slate-500 font-medium">
                        Razão Social: <span className="text-slate-700 font-semibold">{workshop.legal_name}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>CNPJ: <strong>{workshop.cnpj_masked || "Não informado"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{workshop.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400" />
                        <span>{workshop.phone || "Sem telefone"}</span>
                      </div>
                    </div>

                    {(workshop.city || workshop.state) && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span>
                          {workshop.city ? `${workshop.city} - ` : ""}
                          {workshop.state || "Brasil"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações do Joaquim */}
                  <div className="flex items-center gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(workshop)}
                      disabled={processingId === workshop.id || isPending}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                      leftIcon={<XCircle size={15} className="text-rose-600" />}
                    >
                      Recusar
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(workshop)}
                      disabled={processingId === workshop.id || isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs font-bold"
                      leftIcon={
                        processingId === workshop.id ? (
                          <RefreshCw size={15} className="animate-spin text-white" />
                        ) : (
                          <CheckCircle2 size={15} className="text-white" />
                        )
                      }
                    >
                      {processingId === workshop.id ? "Aprovando..." : "✅ Aprovar Credenciamento"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO: ATIVAS OU TODAS (Tabela consolidada) */}
      {activeTab !== "pending" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {filteredWorkshops.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900">
                {workshops.length === 0
                  ? "Nenhuma oficina parceira credenciada ainda"
                  : "Nenhuma oficina encontrada nesta categoria"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                {workshops.length === 0
                  ? "O ecossistema está pronto para receber cadastros reais. Cadastre o primeiro centro parceiro pelo botão acima ou aguarde propostas de adesão."
                  : "Tente ajustar os termos de busca ou clique na aba \"Aguardando Aprovação\"."}
              </p>
              {workshops.length === 0 && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={<Plus size={15} />}
                    className="bg-[#034EFE] text-white shadow-md mx-auto"
                  >
                    + Credenciar Primeira Oficina
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Centro Automotivo / Razão</th>
                    <th className="px-5 py-3.5">CNPJ</th>
                    <th className="px-5 py-3.5">Contato</th>
                    <th className="px-5 py-3.5">Cidade / UF</th>
                    <th className="px-5 py-3.5">Credenciado em</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkshops.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{item.trade_name}</span>
                        <span className="text-[11px] text-slate-400 block">{item.legal_name}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                        {item.cnpj_masked || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block font-medium text-slate-800">{item.email}</span>
                        <span className="block text-[11px] text-slate-400">{item.phone}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {item.city ? `${item.city} / ${item.state || "BR"}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {item.status === "pending_approval" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleReject(item)}
                              className="text-rose-600 border-rose-200"
                            >
                              Recusar
                            </Button>
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleApprove(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Aprovar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleToggleStatus(item)}
                              className={
                                item.status === "active"
                                  ? "text-amber-700 hover:bg-amber-50"
                                  : "text-emerald-700 hover:bg-emerald-50"
                              }
                            >
                              {item.status === "active" ? "Suspender" : "Reativar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleOpenDecommission(item)}
                              leftIcon={<Trash2 size={12} />}
                            >
                              Descredenciar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREDENCIAR DIRETAMENTE (Joaquim) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Credenciar Nova Oficina Diretamente
                </h3>
                <p className="text-xs text-slate-500">
                  Cadastre um centro automotivo com ativação imediata pelo Admin.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleDirectSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.tradeName}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, tradeName: e.target.value })
                    }
                    placeholder="Ex: Auto Center Pinheiros"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={modalForm.legalName}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, legalName: e.target.value })
                    }
                    placeholder="Ex: Pinheiros Mecânica Ltda"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.cnpj}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, cnpj: e.target.value })
                    }
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    E-mail do Responsável *
                  </label>
                  <input
                    type="email"
                    required
                    value={modalForm.email}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, email: e.target.value })
                    }
                    placeholder="contato@oficina.com.br"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={modalForm.phone}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, phone: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={modalForm.city}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, city: e.target.value })
                    }
                    placeholder="São Paulo"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={modalForm.state}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, state: e.target.value.toUpperCase() })
                    }
                    placeholder="SP"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#034EFE]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
                  disabled={modalLoading}
                  className="bg-[#034EFE] text-white"
                  leftIcon={modalLoading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                >
                  {modalLoading ? "Salvando..." : "Credenciar e Ativar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DESCREDENCIAR OFICINA & REALOCAR MOTORISTAS */}
      {decommissioningWorkshop && (
        <Modal
          isOpen={Boolean(decommissioningWorkshop)}
          onClose={() => !isDecommissioning && setDecommissioningWorkshop(null)}
          title="Descredenciar Oficina Parceira"
          description="Gestão de encerramento de credenciamento e realocação segura de clientes"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                disabled={isDecommissioning}
                onClick={() => setDecommissioningWorkshop(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                isLoading={isDecommissioning}
                onClick={handleConfirmDecommission}
              >
                {isDecommissioning ? "Processando transição..." : "Confirmar Descredenciamento"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-sm">{decommissioningWorkshop.trade_name}</p>
              <p className="text-xs text-slate-500">
                CNPJ: {decommissioningWorkshop.cnpj_masked || "Não informado"} • {decommissioningWorkshop.city || "—"}/{decommissioningWorkshop.state || "—"}
              </p>
            </div>

            {assignedMotoristasCount > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>Atenção: {assignedMotoristasCount} motorista(s) vinculado(s)</span>
                </div>
                <p>
                  Para não deixar estes motoristas desassistidos, selecione uma oficina ativa substituta para assumir o atendimento:
                </p>
                <select
                  className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  value={fallbackWorkshopId}
                  onChange={(e) => setFallbackWorkshopId(e.target.value)}
                >
                  <option value="">Selecione a oficina de destino...</option>
                  {workshops
                    .filter((w) => w.id !== decommissioningWorkshop.id && w.status === "active")
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.trade_name} ({w.city || "Matriz"})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Nenhum motorista está vinculado exclusivamente a esta oficina no momento.</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deletePermanently}
                  onChange={(e) => setDeletePermanently(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Excluir registro permanentemente do banco de dados (caso não haja histórico fiscal)</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

