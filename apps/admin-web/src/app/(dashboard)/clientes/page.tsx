"use client";

import React, { useState } from "react";
import {
  PageHeader,
  FilterBar,
  DataTable,
  StatusBadge,
  Button,
  Badge,
  ShieldCheck,
  Download
} from "@grupo-j/ui-web";
import { mockCustomer, mockVehicle } from "@grupo-j/test-utils";

interface MotoristaRow {
  id: string;
  name: string;
  email: string;
  cpfMasked: string;
  blindIndex: string;
  plate: string;
  vehicle: string;
  status: string;
  plan: string;
}

const mockMotoristas: MotoristaRow[] = [
  {
    id: "1",
    name: mockCustomer.fullName,
    email: mockCustomer.email,
    cpfMasked: mockCustomer.cpfMasked,
    blindIndex: "8f4a...29c1",
    plate: mockVehicle.plate,
    vehicle: `${mockVehicle.brand} ${mockVehicle.model}`,
    status: "Ativa",
    plan: "R$ 50,00/mês"
  },
  {
    id: "2",
    name: "Mariana Costa",
    email: "mariana.costa@email.com",
    cpfMasked: "***.782.901-**",
    blindIndex: "3b12...77e4",
    plate: "ABC-1234",
    vehicle: "Toyota Corolla GLi",
    status: "Ativa",
    plan: "R$ 50,00/mês"
  },
  {
    id: "3",
    name: "Fernando Ramos",
    email: "fernando.ramos@email.com",
    cpfMasked: "***.321.654-**",
    blindIndex: "6a99...11d0",
    plate: "RIO-9988",
    vehicle: "Chevrolet Onix Plus",
    status: "Pendente",
    plan: "R$ 50,00/mês"
  }
];

export default function ClientesAdminPage() {
  const [search, setSearch] = useState("");

  const filtered = mockMotoristas.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.plate.toLowerCase().includes(search.toLowerCase()) ||
      m.cpfMasked.includes(search)
  );

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Motoristas Cadastrados"
        subtitle="Gestão de clientes finais, dados veiculares, blind index para consultas e status contratual."
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="success" size="md">
              <ShieldCheck size={14} className="mr-1 inline" />
              CPFs Mascarados (LGPD)
            </Badge>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
              Exportar
            </Button>
          </div>
        }
      />

      <FilterBar
        searchPlaceholder="Buscar por nome, placa ou trecho de CPF..."
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <DataTable
          columns={[
            {
              key: "name",
              header: "Nome / E-mail",
              render: (item) => (
                <div>
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="block text-xs text-slate-400">{item.email}</span>
                </div>
              )
            },
            {
              key: "cpfMasked",
              header: "CPF Mascarado",
              render: (item) => (
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {item.cpfMasked}
                </span>
              )
            },
            {
              key: "blindIndex",
              header: "Blind Index",
              render: (item) => (
                <span className="font-mono text-[11px] text-slate-400" title="Hash criptográfico HMAC-SHA256 para indexação exata">
                  {item.blindIndex}
                </span>
              )
            },
            {
              key: "vehicle",
              header: "Veículo Principal",
              render: (item) => (
                <div>
                  <span className="font-bold font-mono text-slate-800">{item.plate}</span>
                  <span className="block text-xs text-slate-500 font-sans">{item.vehicle}</span>
                </div>
              )
            },
            {
              key: "status",
              header: "Assinatura",
              render: (item) => (
                <div>
                  <StatusBadge status={item.status} size="sm" />
                  <span className="block text-[10px] text-slate-400 mt-0.5">{item.plan}</span>
                </div>
              )
            },
            {
              key: "actions",
              header: "Ações",
              align: "right",
              render: () => (
                <Button variant="outline" size="xs">
                  Prontuário
                </Button>
              )
            }
          ]}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyTitle="Nenhum motorista encontrado"
          emptyDescription="Tente outro termo de busca."
        />
      </div>
    </div>
  );
}
