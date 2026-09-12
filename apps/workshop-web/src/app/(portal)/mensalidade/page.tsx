"use client";

import React from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  DataTable,
  Receipt,
  CheckCircle2,
  Calendar,
  CreditCard,
  Download
} from "@grupo-j/ui-web";

interface Fatura {
  id: string;
  competence: string;
  dueDate: string;
  amount: string;
  status: string;
}

const mockFaturas: Fatura[] = [
  { id: "1", competence: "Setembro / 2026", dueDate: "10/09/2026", amount: "R$ 500,00", status: "Pago" },
  { id: "2", competence: "Agosto / 2026", dueDate: "10/08/2026", amount: "R$ 500,00", status: "Pago" },
  { id: "3", competence: "Julho / 2026", dueDate: "10/07/2026", amount: "R$ 500,00", status: "Pago" }
];

export default function MensalidadeOficinaPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Assinatura B2B da Oficina"
        subtitle="Gestão da mensalidade de credenciamento e acesso à plataforma de parceiros Grupo J."
        actions={
          <Badge variant="success" size="md">
            <CheckCircle2 size={13} className="mr-1 inline" />
            Credenciamento Regular
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="elevated" className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Plano Centro Automotivo Parceiro</CardTitle>
              <CardDescription>
                Acesso irrestrito ao SaaS de validação, recebimento de motoristas da rede e divulgação no app.
              </CardDescription>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center shrink-0">
              <Receipt size={20} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500">Valor da Mensalidade</span>
                <p className="text-2xl font-black text-[#00091D]">R$ 500,00 <span className="text-xs font-normal text-slate-500">/ mês</span></p>
              </div>
              <Badge variant="success" size="md">Em dia</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-100">
                <Calendar size={16} className="text-[#034EFE]" />
                <div>
                  <span className="block text-slate-400">Próximo vencimento:</span>
                  <strong className="text-slate-800 font-bold">10/10/2026</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-100">
                <CreditCard size={16} className="text-[#034EFE]" />
                <div>
                  <span className="block text-slate-400">Cobrança automática:</span>
                  <strong className="text-slate-800 font-bold">Cartão final 8842</strong>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-0">
            <Button variant="outline" size="sm">
              Alterar Cartão
            </Button>
            <Button variant="primary" size="sm">
              Emitir 2ª Via
            </Button>
          </CardFooter>
        </Card>

        {/* Card Informativo Lateral */}
        <Card variant="elevated" className="bg-[#041129] border-[#13254A] text-white">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-bold text-sm text-blue-300">Retorno da Parceria</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Neste mês, sua oficina atendeu <strong>42 motoristas</strong> da rede e gerou{" "}
              <strong>R$ 3.840,00</strong> em serviços corretivos adicionais (upsell).
            </p>
            <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-800/40 text-[11px] text-blue-200">
              A mensalidade de R$ 500 se paga já nos primeiros atendimentos do mês.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Faturas */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Histórico de Mensalidades</CardTitle>
          <span className="text-xs text-slate-400 font-medium">Comprovantes fiscais disponíveis</span>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={[
              {
                key: "competence",
                header: "Competência",
                render: (item) => <strong className="font-bold text-slate-900">{item.competence}</strong>
              },
              {
                key: "dueDate",
                header: "Vencimento",
                render: (item) => <span className="text-xs text-slate-500 font-mono">{item.dueDate}</span>
              },
              {
                key: "amount",
                header: "Valor",
                render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>
              },
              {
                key: "status",
                header: "Status",
                render: (item) => <Badge variant="success" size="sm">{item.status}</Badge>
              },
              {
                key: "actions",
                header: "Comprovante",
                align: "right",
                render: () => (
                  <Button variant="ghost" size="xs" leftIcon={<Download size={14} />}>
                    PDF
                  </Button>
                )
              }
            ]}
            data={mockFaturas}
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
