"use client";

import React, { useState } from "react";
import {
  PageHeader,
  FilterBar,
  DataTable,
  StatusBadge,
  Button,
  Plus,
  Download
} from "@grupo-j/ui-web";
import { mockWorkshop } from "@grupo-j/test-utils";

interface OficinaRow {
  id: string;
  tradingName: string;
  legalName: string;
  cityState: string;
  monthlyFee: string;
  feeStatus: string;
  activeCustomers: number;
  rating: string;
  status: string;
}

const mockOficinas: OficinaRow[] = [
  {
    id: "1",
    tradingName: "Auto Mecânica Modelo Barra",
    legalName: "Auto Mecânica Modelo Barra LTDA",
    cityState: `${mockWorkshop.addressCity}/${mockWorkshop.addressState}`,
    monthlyFee: "R$ 500,00",
    feeStatus: "Em dia",
    activeCustomers: 184,
    rating: `★ ${mockWorkshop.ratingAverage} (${mockWorkshop.ratingCount})`,
    status: "Ativo"
  },
  {
    id: "2",
    tradingName: "Centro Automotivo Paulista",
    legalName: "Paulista Freios & Suspensão LTDA",
    cityState: "São Paulo/SP",
    monthlyFee: "R$ 500,00",
    feeStatus: "Em dia",
    activeCustomers: 142,
    rating: "★ 4.8 (89)",
    status: "Ativo"
  },
  {
    id: "3",
    tradingName: "Oficina Pneutec Sul",
    legalName: "Pneutec Pneus e Serviços EIRELI",
    cityState: "Curitiba/PR",
    monthlyFee: "R$ 500,00",
    feeStatus: "Pendente",
    activeCustomers: 78,
    rating: "★ 4.7 (45)",
    status: "Em Análise"
  }
];

export default function OficinasAdminPage() {
  const [search, setSearch] = useState("");

  const filtered = mockOficinas.filter(
    (o) =>
      o.tradingName.toLowerCase().includes(search.toLowerCase()) ||
      o.legalName.toLowerCase().includes(search.toLowerCase()) ||
      o.cityState.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Oficinas Parceiras (Centros Automotivos)"
        subtitle="Rede de centros automotivos credenciados com isolamento multiempresa via Row Level Security."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>
              Exportar
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              Credenciar Nova Oficina
            </Button>
          </div>
        }
      />

      <FilterBar
        searchPlaceholder="Buscar por nome fantasia, razão social ou cidade..."
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch("")}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <DataTable
          columns={[
            {
              key: "tradingName",
              header: "Centro Automotivo",
              render: (item) => (
                <div>
                  <span className="font-bold text-slate-900">{item.tradingName}</span>
                  <span className="block text-xs text-slate-400">{item.legalName}</span>
                </div>
              )
            },
            {
              key: "cityState",
              header: "Localização",
              render: (item) => <span className="text-xs text-slate-600 font-medium">{item.cityState}</span>
            },
            {
              key: "monthlyFee",
              header: "Mensalidade B2B",
              render: (item) => (
                <div>
                  <span className="font-bold text-slate-900 text-xs">{item.monthlyFee}</span>
                  <div className="mt-0.5">
                    <StatusBadge status={item.feeStatus} size="sm" />
                  </div>
                </div>
              )
            },
            {
              key: "activeCustomers",
              header: "Clientes Vinculados",
              render: (item) => (
                <span className="font-bold text-slate-800 text-sm">{item.activeCustomers}</span>
              )
            },
            {
              key: "rating",
              header: "Avaliação",
              render: (item) => <span className="text-xs font-semibold text-amber-600">{item.rating}</span>
            },
            {
              key: "status",
              header: "Status",
              render: (item) => <StatusBadge status={item.status} size="sm" />
            },
            {
              key: "actions",
              header: "Ações",
              align: "right",
              render: () => (
                <Button variant="outline" size="xs">
                  Gerenciar
                </Button>
              )
            }
          ]}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyTitle="Nenhuma oficina localizada"
          emptyDescription="Tente outro termo de busca."
        />
      </div>
    </div>
  );
}
