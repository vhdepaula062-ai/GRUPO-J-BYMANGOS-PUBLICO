"use client";

import React, { useState } from "react";
import {
  PageHeader,
  FilterBar,
  DataTable,
  StatusBadge,
  Button
} from "@grupo-j/ui-web";
import { mockCustomer, mockVehicle } from "@grupo-j/test-utils";

interface ClienteRow {
  id: string;
  name: string;
  phone: string;
  plate: string;
  model: string;
  memberSince: string;
  status: string;
}

const mockClientes: ClienteRow[] = [
  {
    id: "1",
    name: mockCustomer.fullName,
    phone: mockCustomer.phone,
    plate: mockVehicle.plate,
    model: `${mockVehicle.brand} ${mockVehicle.model}`,
    memberSince: "15/01/2026",
    status: "Ativa"
  },
  {
    id: "2",
    name: "Mariana Costa",
    phone: "(11) 98765-4321",
    plate: "ABC-1234",
    model: "Toyota Corolla GLi",
    memberSince: "02/02/2026",
    status: "Ativa"
  },
  {
    id: "3",
    name: "Fernando Ramos",
    phone: "(21) 97123-8899",
    plate: "RIO-9988",
    model: "Chevrolet Onix Plus",
    memberSince: "20/03/2026",
    status: "Ativa"
  }
];

export default function ClientesOficinaPage() {
  const [search, setSearch] = useState("");

  const filtered = mockClientes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.plate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Clientes Vinculados à Oficina"
        subtitle="Motoristas ativos que escolheram seu centro automotivo como referência (isolado via RLS)."
      />

      <FilterBar
        searchPlaceholder="Buscar por nome ou placa do cliente..."
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Nome do Motorista",
              render: (item) => (
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="block text-xs text-slate-400">{item.phone}</span>
                </div>
              )
            },
            {
              key: "plate",
              header: "Veículo / Placa",
              render: (item) => (
                <div>
                  <span className="font-bold font-mono text-slate-900">{item.plate}</span>
                  <span className="block text-xs text-slate-500 font-sans">{item.model}</span>
                </div>
              )
            },
            {
              key: "memberSince",
              header: "Cliente Desde",
              render: (item) => <span className="text-xs text-slate-500">{item.memberSince}</span>
            },
            {
              key: "status",
              header: "Assinatura (R$ 50/mês)",
              render: (item) => <StatusBadge status={item.status} size="sm" />
            },
            {
              key: "actions",
              header: "Ações",
              align: "right",
              render: () => (
                <Button variant="outline" size="xs">
                  Histórico
                </Button>
              )
            }
          ]}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyTitle="Nenhum cliente localizado"
          emptyDescription="Tente buscar por outro termo ou placa."
        />
      </div>
    </div>
  );
}
