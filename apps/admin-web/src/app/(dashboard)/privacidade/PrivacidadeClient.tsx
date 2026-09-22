"use client";

import React, { useState } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Badge,
  Button,
  Modal,
  Alert,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2
} from "@grupo-j/ui-web";
import { formatDate } from "@/lib/format";
import { approveErasureRequestAction, rejectErasureRequestAction } from "./actions";

export interface ErasureItem {
  id: string;
  protocol: string;
  user_id: string;
  status: string;
  requested_at: string;
  deadline_at: string;
  notes: string | null;
  titular_name: string;
  titular_email: string;
}

interface Props {
  initialRequests: ErasureItem[];
}

export function PrivacidadeClient({ initialRequests }: Props) {
  const [requests, setRequests] = useState<ErasureItem[]>(initialRequests);
  const [selectedForApproval, setSelectedForApproval] = useState<ErasureItem | null>(null);
  const [selectedForRejection, setSelectedForRejection] = useState<ErasureItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleApprove = async () => {
    if (!selectedForApproval) return;
    setIsProcessing(true);
    try {
      const res = await approveErasureRequestAction(selectedForApproval.id, selectedForApproval.user_id);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === selectedForApproval.id ? { ...r, status: "identity_check" } : r))
        );
        setFeedback({
          type: "success",
          message: `Protocolo ${selectedForApproval.protocol} executado. Conta e dados do titular foram permanentemente apagados.`
        });
        setSelectedForApproval(null);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao aprovar solicitação."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedForRejection) return;
    setIsProcessing(true);
    try {
      const res = await rejectErasureRequestAction(selectedForRejection.id, rejectReason);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === selectedForRejection.id ? { ...r, status: "rejected", notes: rejectReason } : r))
        );
        setFeedback({
          type: "success",
          message: `Protocolo ${selectedForRejection.protocol} foi recusado.`
        });
        setSelectedForRejection(null);
        setRejectReason("");
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao recusar solicitação."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm">Exclusão Concluída</Badge>;
      case "rejected":
        return <Badge variant="danger" size="sm">Recusado</Badge>;
      case "identity_check":
        return <Badge variant="warning" size="sm">Checagem de Identidade</Badge>;
      default:
        return <Badge variant="warning" size="sm">Pendente de Análise</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Privacidade & Governança LGPD"
        subtitle="Gestão centralizada dos direitos dos titulares (Artigo 18 da Lei Geral de Proteção de Dados)"
      />

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "danger"}
          title={feedback.type === "success" ? "Operação realizada" : "Erro"}
          onClose={() => setFeedback(null)}
        >
          <div className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="ml-4 text-xs underline font-semibold cursor-pointer opacity-80 hover:opacity-100"
            >
              Dispensar
            </button>
          </div>
        </Alert>
      )}

      {/* Card de Resumo de Governança */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center shrink-0 font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazo Legal</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">15 Dias Úteis</p>
            <span className="text-[11px] text-slate-500">Art. 19, II da LGPD</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {requests.filter((r) => r.status === "requested" || r.status === "identity_check").length}
            </p>
            <span className="text-[11px] text-amber-700">Aguardando deliberação</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expurgados</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {requests.filter((r) => r.status === "completed").length}
            </p>
            <span className="text-[11px] text-emerald-700">Dados eliminados</span>
          </div>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Solicitações de Exclusão de Contas e Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShieldCheck size={40} className="mx-auto mb-2 opacity-50 text-emerald-600" />
              <p className="text-base font-semibold text-slate-800">Nenhuma solicitação de exclusão registrada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Quando um motorista solicitar a exclusão da sua conta pelo aplicativo móvel, o protocolo aparecerá aqui para aprovação do Administrador.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                columns={[
                  {
                    key: "protocol",
                    header: "Protocolo",
                    render: (item: ErasureItem) => (
                      <span className="font-mono text-xs font-bold text-slate-800">{item.protocol}</span>
                    )
                  },
                  {
                    key: "titular",
                    header: "Titular",
                    render: (item: ErasureItem) => (
                      <div>
                        <span className="font-bold text-sm text-slate-900">{item.titular_name}</span>
                        <span className="block text-xs text-slate-400">{item.titular_email}</span>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (item: ErasureItem) => getStatusBadge(item.status)
                  },
                  {
                    key: "requested_at",
                    header: "Solicitada em",
                    render: (item: ErasureItem) => (
                      <span className="text-xs text-slate-600 font-medium">{formatDate(item.requested_at)}</span>
                    )
                  },
                  {
                    key: "deadline_at",
                    header: "Prazo Limite",
                    render: (item: ErasureItem) => (
                      <span className="text-xs font-semibold text-slate-700">{formatDate(item.deadline_at)}</span>
                    )
                  },
                  {
                    key: "actions",
                    header: "Ações",
                    align: "right",
                    render: (item: ErasureItem) => (
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== "completed" && item.status !== "rejected" ? (
                          <>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setSelectedForRejection(item)}
                            >
                              Recusar
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              leftIcon={<Trash2 size={12} />}
                              onClick={() => setSelectedForApproval(item)}
                            >
                              Analisar pedido
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Processado</span>
                        )}
                      </div>
                    )
                  }
                ]}
                data={requests}
                keyExtractor={(item: ErasureItem) => item.id}
                emptyTitle="Nenhum registro"
                emptyDescription=""
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Aprovação de Exclusão LGPD */}
      {selectedForApproval && (
        <Modal
          isOpen={Boolean(selectedForApproval)}
          onClose={() => !isProcessing && setSelectedForApproval(null)}
          title="Analisar identidade e retenção"
          description="Atendimento ao direito de eliminação de dados (Art. 18, VI da LGPD)"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => setSelectedForApproval(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                isLoading={isProcessing}
                onClick={handleApprove}
              >
                {isProcessing ? "Eliminando registros..." : "Confirmar e Apagar Definitivamente"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-slate-700 text-sm">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-rose-950 mb-1">Análise prévia obrigatória:</p>
                Este pedido será encaminhado para confirmação de identidade e análise de retenção. Nenhum dado será apagado nesta etapa. Titular:{" "}
                <strong>{selectedForApproval.titular_name}</strong> ({selectedForApproval.titular_email}).
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Protocolo: <strong className="font-mono text-slate-800">{selectedForApproval.protocol}</strong>
            </p>
          </div>
        </Modal>
      )}

      {/* Modal de Recusa de Solicitação LGPD */}
      {selectedForRejection && (
        <Modal
          isOpen={Boolean(selectedForRejection)}
          onClose={() => !isProcessing && setSelectedForRejection(null)}
          title="Recusar Solicitação de Exclusão"
          description="Justifique a negativa fundamentada nas exceções da LGPD (ex: obrigação legal ou fiscal)"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => setSelectedForRejection(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handleReject}
              >
                Registrar Recusa
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-slate-700">
            <label className="block text-xs font-semibold text-slate-800">
              Motivo legal da recusa:
            </label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
              rows={3}
              placeholder="Ex: Titular possui faturas em aberto ou pendências contratuais não quitadas..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
