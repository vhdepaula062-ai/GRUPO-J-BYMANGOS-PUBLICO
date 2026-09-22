"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  Badge,
  ShieldCheck,
  Download,
  Users,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Modal,
  Alert
} from "@grupo-j/ui-web";
import type { MotoristRow } from "@/lib/queries";
import { formatDate, statusText } from "@/lib/format";
import { exportToCsv } from "@/lib/exportCsv";
import { ClienteSearchBar } from "./ClienteSearchBar";
import {useRouter} from "next/navigation";

interface ClientesClientProps {
  initialMotoristas: MotoristRow[];
  search?: string;
}

export function ClientesClient({ initialMotoristas, search = "" }: ClientesClientProps) {
  const [motoristas, setMotoristas] = useState<MotoristRow[]>(initialMotoristas);
  const [viewingMotorista, setViewingMotorista] = useState<MotoristRow | null>(null);
  const router=useRouter();
  const setDeletingMotorista=(_person:MotoristRow)=>router.push("/privacidade");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setMotoristas(initialMotoristas);
  }, [initialMotoristas]);

  const handleExportCsv = () => {
    exportToCsv(
      "motoristas_assinantes_grupo_j",
      [
        { key: "full_name", header: "Nome Completo" },
        { key: "email", header: "E-mail" },
        { key: "phone", header: "Telefone", format: (v) => v || "Não informado" },
        { key: "cpf_masked", header: "CPF", format: (v) => v || "***.***.***-**" },
        { key: "created_at", header: "Cadastrado em", format: (v) => formatDate(v) },
        { key: "subscription_status", header: "Assinatura", format: (v) => statusText(v || "none") }
      ],
      motoristas
    );
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Motoristas Assinantes"
        subtitle="Motoristas cadastrados e situação contratual registrada no ecossistema."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={handleExportCsv}
            >
              Exportar CSV
            </Button>
          </div>
        }
      />

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "danger"}
          title={feedback.type === "success" ? "Operação concluída" : "Atenção"}
          onClose={() => setFeedback(null)}
          className="animate-in fade-in duration-200"
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

      <Suspense fallback={<div className="h-10 bg-slate-100 rounded-xl animate-pulse" />}>
        <ClienteSearchBar defaultValue={search} />
      </Suspense>

      {motoristas.length === 0 && !search ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#034EFE]">
            <Users size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum motorista assinante ainda</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Os motoristas se cadastram diretamente pelo aplicativo mobile. A cobrança depende da integração do gateway.
            Assim que o primeiro assinar, ele aparecerá aqui com os dados protegidos por criptografia.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold">
            <ShieldCheck size={14} />
            <span>Os documentos são cifrados e apresentados com máscara.</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <DataTable
            columns={[
              {
                key: "full_name",
                header: "Motorista",
                render: (item: MotoristRow) => (
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{item.full_name}</span>
                    <span className="block text-xs text-slate-400">{item.email}</span>
                  </div>
                )
              },
              {
                key: "cpf_masked",
                header: "CPF (Protegido)",
                render: (item: MotoristRow) => (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-slate-700">
                      {item.cpf_masked ?? "***.***.***-**"}
                    </span>
                    <Badge variant="success" size="sm" className="text-[9px]">
                      AES-256
                    </Badge>
                  </div>
                )
              },
              {
                key: "created_at",
                header: "Assinante desde",
                render: (item: MotoristRow) => (
                  <span className="text-xs text-slate-600 font-medium">{formatDate(item.created_at)}</span>
                )
              },
              {
                key: "subscription_status",
                header: "Assinatura",
                render: (item: MotoristRow) => (
                  <StatusBadge status={statusText(item.subscription_status ?? "none")} size="sm" />
                )
              },
              {
                key: "actions",
                header: "Ações",
                align: "right",
                render: (item: MotoristRow) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setViewingMotorista(item)}
                    >
                      Ver Perfil
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 border-rose-200"
                      leftIcon={<Trash2 size={12} />}
                      onClick={() => {
                        setDeletingMotorista(item);
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                )
              }
            ]}
            data={motoristas}
            keyExtractor={(item: MotoristRow) => item.id}
            emptyTitle="Nenhum motorista localizado"
            emptyDescription="Tente outro termo de busca."
          />
        </div>
      )}

      {motoristas.length > 0 && (
        <p className="text-xs text-slate-500 text-right">
          {motoristas.length} motorista{motoristas.length !== 1 ? "s" : ""} encontrado{motoristas.length !== 1 ? "s" : ""}
          {search ? ` para "${search}"` : ""}
        </p>
      )}

      {/* Modal: Detalhes do Perfil do Motorista */}
      {viewingMotorista && (
        <Modal
          isOpen={Boolean(viewingMotorista)}
          onClose={() => setViewingMotorista(null)}
          title="Perfil do Motorista"
          description="Informações cadastrais e governança do cliente no ecossistema Grupo J"
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                leftIcon={<Trash2 size={14} />}
                onClick={() => {
                  const m = viewingMotorista;
                  setViewingMotorista(null);
                  setDeletingMotorista(m);
                }}
              >
                Excluir Conta e Dados
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingMotorista(null)}
              >
                Fechar
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-slate-700 text-sm">
            {/* Header do Perfil */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#034EFE] flex items-center justify-center font-bold text-lg">
                {viewingMotorista.full_name?.charAt(0)?.toUpperCase() || "M"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {viewingMotorista.full_name}
                </h4>
                <p className="text-xs text-slate-500 truncate">{viewingMotorista.email}</p>
              </div>
              <StatusBadge
                status={statusText(viewingMotorista.subscription_status ?? "none")}
                size="sm"
              />
            </div>

            {/* Informações detalhadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <User size={12} />
                  <span>Nome Completo</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{viewingMotorista.full_name}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Mail size={12} />
                  <span>E-mail</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{viewingMotorista.email}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Phone size={12} />
                  <span>Telefone</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {viewingMotorista.phone || "Não informado"}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <ShieldCheck size={12} />
                  <span>CPF Criptografado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {viewingMotorista.cpf_masked ?? "***.***.***-**"}
                  </span>
                  <Badge variant="success" size="sm" className="text-[9px]">
                    AES-256
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar size={12} />
                  <span>Cadastro no Sistema</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(viewingMotorista.created_at)}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <span>ID do Cliente</span>
                </div>
                <p className="font-mono text-xs text-slate-500 truncate" title={viewingMotorista.id}>
                  {viewingMotorista.id}
                </p>
              </div>
            </div>

            {/* Aviso de Privacidade e LGPD */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
              <ShieldCheck size={16} className="text-[#034EFE] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Privacidade & LGPD: </span>
                Os dados são armazenados em conformidade com as diretrizes de segurança da informação.
                Caso o titular solicite revogação ou exclusão definitiva, utilize a opção de exclusão.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Confirmação de Exclusão Definitiva de Motorista */}

    </div>
  );
}
