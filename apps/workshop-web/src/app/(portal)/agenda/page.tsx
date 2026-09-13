"use client";

import React, { useState } from "react";
import {
  PageHeader,
  Button,
  Input,
  Clock,
  Car,
  Calendar,
  Plus,
  CheckCircle2,
  X,
  Filter
} from "@grupo-j/ui-web";

interface Agendamento {
  id: string;
  time: string;
  date: "hoje" | "amanha" | "semana";
  customerName: string;
  phone: string;
  vehicleModel: string;
  plate: string;
  service: string;
  status: "Confirmado" | "Em Atendimento" | "Concluído";
  attendant?: string;
}

const initialAgendamentos: Agendamento[] = [];

export default function AgendaOficinaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(initialAgendamentos);
  const [selectedDate, setSelectedDate] = useState<"hoje" | "amanha" | "semana">("hoje");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formPlate, setFormPlate] = useState("");
  const [formTime, setFormTime] = useState("15:00");
  const [formService, setFormService] = useState("Alinhamento 3D e Balanceamento");

  const filtered = agendamentos.filter((a) => {
    const matchDate = a.date === selectedDate;
    const matchStatus =
      statusFilter === "todos" ? true : a.status.toLowerCase() === statusFilter.toLowerCase();
    return matchDate && matchStatus;
  });

  const handleCreateAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPlate) return;

    const novo: Agendamento = {
      id: `ag-${Date.now()}`,
      time: formTime,
      date: selectedDate,
      customerName: formName,
      phone: formPhone || "(11) 98888-7777",
      vehicleModel: formModel || "Veículo Particular",
      plate: formPlate.toUpperCase(),
      service: formService,
      status: "Confirmado"
    };

    setAgendamentos([novo, ...agendamentos]);
    setIsModalOpen(false);
    setFormName("");
    setFormPhone("");
    setFormModel("");
    setFormPlate("");
  };

  const handleUpdateStatus = (id: string, newStatus: "Confirmado" | "Em Atendimento" | "Concluído") => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Agenda Operacional de Revisões"
        subtitle="Horários marcados por motoristas cadastrados na rede para atendimento preventivo sem filas."
        actions={
          <Button
            variant="primary"
            size="md"
            className="font-bold shadow-md shadow-blue-600/20"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            + Novo Agendamento
          </Button>
        }
      />

      {/* Barra de Filtro de Datas e Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setSelectedDate("hoje")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedDate === "hoje"
                ? "bg-white text-[#034EFE] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hoje ({agendamentos.filter((a) => a.date === "hoje").length})
          </button>
          <button
            onClick={() => setSelectedDate("amanha")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedDate === "amanha"
                ? "bg-white text-[#034EFE] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Amanhã ({agendamentos.filter((a) => a.date === "amanha").length})
          </button>
          <button
            onClick={() => setSelectedDate("semana")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedDate === "semana"
                ? "bg-white text-[#034EFE] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Próximos 7 Dias
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#034EFE]"
          >
            <option value="todos">Todos os Status</option>
            <option value="confirmado">Confirmados</option>
            <option value="em atendimento">Em Atendimento</option>
            <option value="concluído">Concluídos</option>
          </select>
        </div>
      </div>

      {/* Lista de Cards de Agendamento */}
      <div className="grid grid-cols-1 gap-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum agendamento encontrado para este filtro.</p>
            <p className="text-xs text-slate-400 mt-1">Altere a data ou clique em Novo Agendamento.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Horário & Ícone */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-[#034EFE] shrink-0 font-bold">
                  <Clock size={16} className="mb-0.5" />
                  <span className="text-xs">{item.time}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.customerName}
                    </span>
                    <span className="text-xs text-slate-400">• {item.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Car size={13} className="text-slate-400" />
                    <span className="font-semibold">{item.vehicleModel}</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800 text-[11px]">
                      {item.plate}
                    </span>
                  </div>

                  <p className="text-xs text-[#034EFE] font-medium pt-0.5">
                    Serviço: <span className="font-semibold">{item.service}</span>
                  </p>
                </div>
              </div>

              {/* Status & Ações Rápidas */}
              <div className="flex items-center gap-3 self-end md:self-center">
                {item.status === "Concluído" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={13} />
                    Concluído
                  </span>
                )}
                {item.status === "Em Atendimento" && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Em Atendimento
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs h-8"
                      onClick={() => handleUpdateStatus(item.id, "Concluído")}
                    >
                      Finalizar
                    </Button>
                  </div>
                )}
                {item.status === "Confirmado" && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Confirmado
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-slate-300"
                      onClick={() => handleUpdateStatus(item.id, "Em Atendimento")}
                    >
                      Iniciar Box
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Novo Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Novo Agendamento</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vincule um atendimento ao box mecânico da unidade.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAgendamento} className="space-y-4">
              <Input
                label="Nome do Motorista"
                required
                placeholder="Ex: Rodrigo Fagundes"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone / WhatsApp"
                  placeholder="(11) 99999-8888"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
                <Input
                  label="Placa do Carro"
                  required
                  placeholder="Ex: ABC1D23"
                  value={formPlate}
                  onChange={(e) => setFormPlate(e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Modelo do Veículo"
                  placeholder="Ex: Honda Civic 2021"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                />
                <Input
                  label="Horário do Atendimento"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Benefício Preventivo
                </label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#034EFE]"
                >
                  <option value="Alinhamento 3D e Convergência">Alinhamento 3D e Convergência</option>
                  <option value="Balanceamento e Rodízio de Pneus">Balanceamento e Rodízio de Pneus</option>
                  <option value="Higienização de Ar-Condicionado">Higienização de Ar-Condicionado</option>
                  <option value="Checklist Preventivo Geral (30 itens)">Checklist Preventivo Geral (30 itens)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirmar Agendamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
