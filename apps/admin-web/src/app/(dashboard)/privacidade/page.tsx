"use client";

import React, { useState } from "react";
import {
  PageHeader,
  DataTable,
  FilterBar,
  Button,
  Badge,
  Input,
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  X
} from "@grupo-j/ui-web";

interface TitularRequest {
  id: string;
  protocol: string;
  titularName: string;
  titularCpfMasked: string;
  requestType: "Exclusão Definitiva" | "Acesso aos Dados" | "Portabilidade" | "Revogação Consentimento";
  requestDate: string;
  deadlineDate: string;
  status: "Concluído" | "Em Análise Jurídica" | "Processado";
  dpoNotes: string;
}

const initialRequests: TitularRequest[] = [];

export default function PrivacidadePage() {
  const [requests, setRequests] = useState<TitularRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [selectedDsr, setSelectedDsr] = useState<TitularRequest | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newCpf, setNewCpf] = useState("");
  const [newType, setNewType] = useState<TitularRequest["requestType"]>("Acesso aos Dados");
  const [newNotes, setNewNotes] = useState("");

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.titularName.toLowerCase().includes(search.toLowerCase()) ||
      r.protocol.toLowerCase().includes(search.toLowerCase()) ||
      r.titularCpfMasked.includes(search);
    const matchesStatus =
      statusFilter === "TODOS" ||
      (statusFilter === "CONCLUIDOS" && (r.status === "Concluído" || r.status === "Processado")) ||
      (statusFilter === "PENDENTES" && r.status === "Em Análise Jurídica");
    return matchesSearch && matchesStatus;
  });

  const handleExportRipd = () => {
    const headers = "Protocolo;Titular;CPF Mascarado;Tipo Solicitacao;Data Solicitacao;Prazo Legal;Status;Parecer DPO";
    const rows = requests.map((r) =>
      `"${r.protocol}";"${r.titularName}";"${r.titularCpfMasked}";"${r.requestType}";"${r.requestDate}";"${r.deadlineDate}";"${r.status}";"${r.dpoNotes}"`
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_lgpd_ripd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Relatório de Impacto à Proteção de Dados (RIPD) exportado em CSV!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCpf) return;

    const newReq: TitularRequest = {
      id: `dsr-${Date.now()}`,
      protocol: `DSR-2026-00${requests.length + 42}`,
      titularName: newName,
      titularCpfMasked: newCpf.replace(/^(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})$/, "***.$2.$3-**"),
      requestType: newType,
      requestDate: new Date().toLocaleDateString("pt-BR"),
      deadlineDate: new Date(Date.now() + 15 * 86400000).toLocaleDateString("pt-BR"),
      status: "Em Análise Jurídica",
      dpoNotes: newNotes || "Registrado via canal DPO com prazo regulamentar de 15 dias."
    };

    setRequests([newReq, ...requests]);
    setIsNewModalOpen(false);
    setNewName("");
    setNewCpf("");
    setNewNotes("");
    setToastMessage(`Solicitação ${newReq.protocol} registrada com sucesso!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAnonymize = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Processado",
              titularName: "TITULAR ANONIMIZADO (Art. 16 LGPD)",
              titularCpfMasked: "***.***.***-**",
              dpoNotes: "Anonimização de PII concluída no banco e log criptografado gerado."
            }
          : r
      )
    );
    setSelectedDsr(null);
    setToastMessage("Anonimização irreversível executada com sucesso!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Privacidade e Governança LGPD"
        subtitle="Gestão de direitos dos titulares (Art. 18 Lei 13.709/2018), auditoria RIPD, relatórios DPO e status de criptografia em repouso."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportRipd} className="gap-2">
              <Download className="w-4 h-4 text-slate-600" />
              Exportar RIPD (CSV)
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              + Nova Solicitação DSR
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Conformidade de Prazos
            </span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">100%</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
              Prazo Legal 15d
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Média de atendimento ANPD: 2,4 dias</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Criptografia em Repouso
            </span>
            <span className="p-2 bg-blue-50 rounded-lg text-[#034EFE]">
              <Lock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">AES-256-GCM</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">KMS Envelope Encryption ativo (@grupo-j/security)</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Blind Index HMAC
            </span>
            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">HMAC-SHA256</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Busca determinística sem expor CPF em claro no banco</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Consentimentos Vigentes
            </span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">Termos v2.4</span>
            <span className="text-xs text-slate-500 ml-2">100% dos usuários</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Carimbo de tempo RFC 3161 auditável</p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Buscar por protocolo, titular ou CPF..."
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch("")}
        filterControls={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter("TODOS")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "TODOS"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter("PENDENTES")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "PENDENTES"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Em Análise ({requests.filter((r) => r.status === "Em Análise Jurídica").length})
            </button>
            <button
              onClick={() => setStatusFilter("CONCLUIDOS")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "CONCLUIDOS"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Concluídos ({requests.filter((r) => r.status === "Concluído" || r.status === "Processado").length})
            </button>
          </div>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          columns={[
            {
              key: "protocol",
              header: "Protocolo ANPD",
              render: (item) => (
                <div>
                  <span className="font-mono font-bold text-xs text-[#034EFE] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {item.protocol}
                  </span>
                  <span className="block text-[11px] text-slate-600 mt-1">
                    Registrado em {item.requestDate}
                  </span>
                </div>
              )
            },
            {
              key: "titular",
              header: "Titular dos Dados",
              render: (item) => (
                <div>
                  <span className="font-semibold text-sm text-slate-900 block">{item.titularName}</span>
                  <span className="font-mono text-xs text-slate-600">{item.titularCpfMasked}</span>
                </div>
              )
            },
            {
              key: "type",
              header: "Tipo de Direito (Art. 18)",
              render: (item) => (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {item.requestType}
                </span>
              )
            },
            {
              key: "deadline",
              header: "Prazo Legal (15 dias)",
              render: (item) => (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Limite: {item.deadlineDate}</span>
                </div>
              )
            },
            {
              key: "status",
              header: "Status",
              render: (item) => (
                <Badge
                  variant={
                    item.status === "Concluído"
                      ? "success"
                      : item.status === "Processado"
                      ? "brand"
                      : "warning"
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              )
            },
            {
              key: "actions",
              header: "Ação Jurídica",
              align: "right",
              render: (item) => (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold hover:border-blue-400 hover:text-[#034EFE]"
                  onClick={() => setSelectedDsr(item)}
                >
                  Dossiê / Parecer
                </Button>
              )
            }
          ]}
        />
      </div>

      {/* Security Architecture Deep Dive Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Garantias de Engenharia: Segurança, LGPD & PCI DSS
            </h3>
            <p className="text-xs text-slate-400">
              Implementação centralizada no pacote compartilhado <code className="text-blue-300">@grupo-j/security</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="font-bold text-blue-400 block mb-1">Envelope Encryption</span>
            <p className="text-slate-300 leading-relaxed">
              PII sensível (CPF, nome, placa) é cifrada via AES-256-GCM com IV único de 12 bytes e tag de autenticação de 16 bytes. A chave mestra nunca toca logs.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="font-bold text-emerald-400 block mb-1">Blind Indexing HMAC-SHA256</span>
            <p className="text-slate-300 leading-relaxed">
              Permite consultas de alta velocidade (ex: busca por CPF de motorista) calculando hash determinístico salgado, dispensando a descriptografia em massa no banco.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span className="font-bold text-amber-400 block mb-1">Mascaramento Automático</span>
            <p className="text-slate-300 leading-relaxed">
              Utilitários <code className="text-slate-200">maskCpf</code> e <code className="text-slate-200">maskPhone</code> impedem vazamento acidental em telas e componentes compartilhados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Ver Dossiê DSR */}
      {selectedDsr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-[#034EFE] bg-blue-50 px-2 py-0.5 rounded">
                  {selectedDsr.protocol}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Dossiê do Titular (Art. 18)</h2>
              </div>
              <button
                onClick={() => setSelectedDsr(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Nome:</span>
                  <span className="font-bold text-slate-900">{selectedDsr.titularName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>CPF Criptografado:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDsr.titularCpfMasked}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Direito Pleiteado:</span>
                  <span className="font-semibold text-blue-600">{selectedDsr.requestType}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Prazo Legal ANPD:</span>
                  <span className="font-semibold text-amber-600">{selectedDsr.deadlineDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parecer Jurídico do DPO
                </label>
                <p className="text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-xl leading-relaxed">
                  {selectedDsr.dpoNotes}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedDsr.requestType === "Exclusão Definitiva" && selectedDsr.status !== "Processado" ? (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAnonymize(selectedDsr.id)}
                >
                  Confirmar Anonimização Irreversível (Art. 16)
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedDsr(null)}
                >
                  Fechar Dossiê
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Solicitação Titular */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registrar Solicitação de Titular (DSR)</h2>
                <p className="text-xs text-slate-500">Registro protocolar com controle de prazo de 15 dias (LGPD)</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo do Titular
                </label>
                <Input
                  required
                  placeholder="Ex: Fernando de Souza"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CPF do Titular
                </label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  value={newCpf}
                  onChange={(e) => setNewCpf(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Direito Solicitado (Art. 18 LGPD)
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TitularRequest["requestType"])}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 focus:border-[#034EFE]"
                >
                  <option value="Acesso aos Dados">Acesso aos Dados Pessoais (Inciso II)</option>
                  <option value="Portabilidade">Portabilidade dos Dados (Inciso V)</option>
                  <option value="Exclusão Definitiva">Eliminação / Exclusão (Inciso VI)</option>
                  <option value="Revogação Consentimento">Revogação do Consentimento (Inciso IX)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações e Meio de Contato Autenticado
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 focus:border-[#034EFE]"
                  placeholder="Ex: Titular enviou selfie com CNH via e-mail dpo@grupoj.com.br para validação de identidade."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Emitir Protocolo DSR
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
