"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Button,
  Badge,
  Car,
  User,
  Phone,
  CheckCircle2,
  Plus,
  X
} from "@grupo-j/ui-web";

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  service: string;
  date: string;
  shift: "morning" | "afternoon" | "flexible";
  status: "confirmed" | "completed" | "in_progress" | "canceled";
  notes?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    customerName: "Victor Hugo Alves",
    phone: "(11) 98765-4321",
    vehicle: "Chevrolet Onix 2022 (ABC-1D23)",
    service: "Alinhamento (Convergência) e Balanceamento",
    date: new Date().toISOString().slice(0, 10),
    shift: "morning",
    status: "confirmed",
    notes: "Cliente prefere atendimento no início da manhã."
  },
  {
    id: "apt-2",
    customerName: "Carlos Eduardo Mendes",
    phone: "(11) 97123-8899",
    vehicle: "Hyundai HB20 2021 (BRA-2E45)",
    service: "Higienização de Ar-Condicionado",
    date: new Date().toISOString().slice(0, 10),
    shift: "afternoon",
    status: "confirmed",
    notes: "Aguardará na sala de espera da oficina."
  },
  {
    id: "apt-3",
    customerName: "Mariana Souza Lima",
    phone: "(11) 99345-1122",
    vehicle: "Volkswagen Polo 2023 (XYZ-9A88)",
    service: "Rodízio de Pneus e Check-up Geral",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    shift: "flexible",
    status: "confirmed",
    notes: "Deixará o carro o dia todo."
  }
];

export function AgendaClient() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [service, setService] = useState("Alinhamento (Convergência)");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<"morning" | "afternoon" | "flexible">("morning");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !vehicle) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      customerName,
      phone,
      vehicle,
      service,
      date,
      shift,
      status: "confirmed",
      notes
    };

    setAppointments([newApt, ...appointments]);
    setIsModalOpen(false);
    setCustomerName("");
    setPhone("");
    setVehicle("");
    setNotes("");
  };

  const filtered = appointments.filter(a => {
    if (selectedShiftFilter === "all") return true;
    return a.shift === selectedShiftFilter;
  });

  const getShiftBadge = (s: Appointment["shift"]) => {
    switch (s) {
      case "morning":
        return <Badge variant="info">Manhã (08h - 12h)</Badge>;
      case "afternoon":
        return <Badge variant="warning">Tarde (13h - 18h)</Badge>;
      case "flexible":
        return <Badge variant="neutral">Horário Flexível</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            title="Agenda Operacional Flexível"
            subtitle="Organize os agendamentos da oficina com janelas flexíveis de atendimento."
          />
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
          className="bg-[#034EFE] self-start sm:self-auto"
        >
          Novo Agendamento
        </Button>
      </div>

      {/* Barra de Filtros de Turno */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedShiftFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "all" ? "bg-[#034EFE] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Todos ({appointments.length})
        </button>
        <button
          onClick={() => setSelectedShiftFilter("morning")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "morning" ? "bg-[#034EFE] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Turno Manhã (08h-12h)
        </button>
        <button
          onClick={() => setSelectedShiftFilter("afternoon")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "afternoon" ? "bg-[#034EFE] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Turno Tarde (13h-18h)
        </button>
        <button
          onClick={() => setSelectedShiftFilter("flexible")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "flexible" ? "bg-[#034EFE] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Horário Flexível / Dia Todo
        </button>
      </div>

      {/* Lista de Atendimentos Agendados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((apt) => (
          <Card key={apt.id} variant="elevated" className="border-slate-200/80 hover:shadow-md transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                {getShiftBadge(apt.shift)}
                <span className="text-xs text-slate-400 font-medium">{apt.date}</span>
              </div>
              <CardTitle className="text-base font-bold text-[#00091D] mt-2 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                <span>{apt.customerName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{apt.phone || "Telefone não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-800">{apt.vehicle}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="font-bold text-[#034EFE]">{apt.service}</span>
                </div>
              </div>

              {apt.notes ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 italic">
                  "{apt.notes}"
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criação de Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Novo Agendamento Flexível</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do motorista"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Veículo (Modelo e Placa)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fiat Strada 2023 - PLACA"
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Janela / Turno Flexível</label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value as "morning" | "afternoon" | "flexible")}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 bg-white"
                >
                  <option value="morning">Turno da Manhã (08h às 12h)</option>
                  <option value="afternoon">Turno da Tarde (13h às 18h)</option>
                  <option value="flexible">Horário Flexível (Disponível o dia todo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Serviço Solicitado</label>
                <select
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 bg-white"
                >
                  <option value="Alinhamento (Convergência)">Alinhamento (Convergência)</option>
                  <option value="Balanceamento de Rodas">Balanceamento de Rodas</option>
                  <option value="Higienização de Ar-Condicionado">Higienização de Ar-Condicionado</option>
                  <option value="Rodízio de Pneus">Rodízio de Pneus</option>
                  <option value="Revisão Preventiva Geral">Revisão Preventiva Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observações Internas</label>
                <input
                  type="text"
                  placeholder="Ex: Peças já separadas / cliente aguardará"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#034EFE]">Salvar Agendamento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
