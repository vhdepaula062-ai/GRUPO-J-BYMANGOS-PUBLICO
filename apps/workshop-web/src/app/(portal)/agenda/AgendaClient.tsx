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
  X,
  Calendar,
  Trash2
} from "@grupo-j/ui-web";
import type { AppointmentRow } from "@/lib/queries";
import { createAppointmentAction, deleteAppointmentAction } from "./actions";

interface AgendaClientProps {
  initialAppointments?: AppointmentRow[];
  workshopId?: string;
}

export function AgendaClient({
  initialAppointments = [],
  workshopId = "default"
}: AgendaClientProps) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>(initialAppointments);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [service, setService] = useState("Alinhamento (Convergência)");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<"morning" | "afternoon" | "flexible">("morning");
  const [notes, setNotes] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !vehicle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createAppointmentAction(workshopId, {
        customerName: customerName.trim(),
        phone: phone.trim(),
        vehicle: vehicle.trim(),
        service,
        date,
        shift,
        status: "confirmed",
        notes: notes.trim()
      });

      if (res.success && res.appointment) {
        setAppointments((prev) => [res.appointment!, ...prev]);
        setIsModalOpen(false);
        setCustomerName("");
        setPhone("");
        setVehicle("");
        setNotes("");
      } else {
        alert(res.error || "Erro ao agendar.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao agendar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm("Deseja cancelar e remover este agendamento?")) return;

    setDeletingId(appointmentId);
    try {
      const res = await deleteAppointmentAction(workshopId, appointmentId);
      if (res.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      } else {
        alert(res.error || "Erro ao excluir agendamento.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir agendamento.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = appointments.filter((a) => {
    if (selectedShiftFilter === "all") return true;
    return a.shift === selectedShiftFilter;
  });

  const getShiftBadge = (s: AppointmentRow["shift"]) => {
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
            subtitle="Organize os agendamentos da oficina com janelas flexíveis de atendimento com dados 100% reais."
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
            selectedShiftFilter === "all"
              ? "bg-[#034EFE] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Todos ({appointments.length})
        </button>
        <button
          onClick={() => setSelectedShiftFilter("morning")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "morning"
              ? "bg-[#034EFE] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Turno Manhã (08h-12h) (
          {appointments.filter((a) => a.shift === "morning").length})
        </button>
        <button
          onClick={() => setSelectedShiftFilter("afternoon")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "afternoon"
              ? "bg-[#034EFE] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Turno Tarde (13h-18h) (
          {appointments.filter((a) => a.shift === "afternoon").length})
        </button>
        <button
          onClick={() => setSelectedShiftFilter("flexible")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            selectedShiftFilter === "flexible"
              ? "bg-[#034EFE] text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Horário Flexível (
          {appointments.filter((a) => a.shift === "flexible").length})
        </button>
      </div>

      {/* Lista de Atendimentos Agendados ou Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#034EFE] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {selectedShiftFilter === "all"
              ? "Nenhum agendamento cadastrado"
              : "Nenhum agendamento neste turno"}
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            {selectedShiftFilter === "all"
              ? "Sua oficina opera com dados 100% reais. Clique no botão abaixo para agendar o primeiro serviço."
              : "Alterne o filtro de turno acima ou adicione um novo agendamento para este período."}
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#034EFE] mx-auto"
          >
            Novo Agendamento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((apt) => (
            <Card
              key={apt.id}
              variant="elevated"
              className="border-slate-200/80 hover:shadow-md transition-shadow relative group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  {getShiftBadge(apt.shift)}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{apt.date}</span>
                    <button
                      type="button"
                      title="Excluir Agendamento"
                      onClick={() => handleDelete(apt.id)}
                      disabled={deletingId === apt.id}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors opacity-80 hover:opacity-100 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
                    &ldquo;{apt.notes}&rdquo;
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação de Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Novo Agendamento Flexível</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do motorista"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Veículo (Modelo e Placa) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fiat Strada 2023 - PLACA"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Janela / Turno Flexível
                </label>
                <select
                  value={shift}
                  onChange={(e) =>
                    setShift(e.target.value as "morning" | "afternoon" | "flexible")
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 bg-white"
                >
                  <option value="morning">Turno da Manhã (08h às 12h)</option>
                  <option value="afternoon">Turno da Tarde (13h às 18h)</option>
                  <option value="flexible">Horário Flexível (Disponível o dia todo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Serviço Solicitado
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 bg-white"
                >
                  <option value="Alinhamento (Convergência)">Alinhamento (Convergência)</option>
                  <option value="Balanceamento de Rodas">Balanceamento de Rodas</option>
                  <option value="Higienização de Ar-Condicionado">
                    Higienização de Ar-Condicionado
                  </option>
                  <option value="Rodízio de Pneus">Rodízio de Pneus</option>
                  <option value="Revisão Preventiva Geral">Revisão Preventiva Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações Internas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Peças já separadas / cliente aguardará"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  disabled={isSubmitting}
                  className="bg-[#034EFE]"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Agendamento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
