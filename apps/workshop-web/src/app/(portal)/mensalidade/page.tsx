"use client";

import React, { useState } from "react";
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
  Download,
  QrCode,
  X,
  Copy,
  Input
} from "@grupo-j/ui-web";

interface Fatura {
  id: string;
  competence: string;
  dueDate: string;
  amount: string;
  status: string;
}

const mockFaturas: Fatura[] = [];

export default function MensalidadeOficinaPage() {
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);

  const pixCode = "00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/v2/grupo-j-oficina-mensalidade-500-reais5204000053039865406500.005802BR5915GRUPO J LTDA6009SAO PAULO62070503***6304E8A2";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

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
            <Button variant="outline" size="sm" onClick={() => setIsCardModalOpen(true)}>
              Alterar Cartão
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPixModalOpen(true)}
              leftIcon={<QrCode size={14} />}
            >
              Pix / 2ª Via
            </Button>
          </CardFooter>
        </Card>

        {/* Card Informativo Lateral */}
        <Card variant="elevated" className="bg-[#00091D] border-[#13254A] text-white">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-bold text-sm text-blue-400">Retorno da Parceria</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Neste mês, sua oficina atendeu <strong>42 motoristas</strong> da rede e gerou{" "}
              <strong>R$ 15.960,00</strong> em serviços adicionais orçados na hora (upsell).
            </p>
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-900/60 text-[11px] text-blue-300">
              A mensalidade de R$ 500 se paga com folga logo no primeiro cliente encaminhado pelo app.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Faturas */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Histórico de Mensalidades B2B</CardTitle>
          <span className="text-xs text-slate-400 font-medium">Notas fiscais e recibos de pagamento</span>
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
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={<Download size={14} />}
                    onClick={() => alert("Comprovante fiscal baixado com sucesso!")}
                  >
                    NF-e / PDF
                  </Button>
                )
              }
            ]}
            data={mockFaturas}
            keyExtractor={(item) => item.id}
          />
        </CardContent>
      </Card>

      {/* Modal Pix 2ª Via */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Pix — Mensalidade Grupo J</h3>
                <p className="text-xs text-slate-500">Vencimento: 10/10/2026 • R$ 500,00</p>
              </div>
              <button
                onClick={() => setIsPixModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-48 h-48 bg-slate-100 mx-auto rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              <QrCode size={120} className="text-[#034EFE]" />
            </div>

            <p className="text-xs text-slate-500">
              Escaneie o QR Code no seu aplicativo bancário ou utilize a chave Pix Copia e Cola abaixo:
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Pix Copia e Cola:</span>
              <p className="font-mono text-xs text-slate-700 truncate mt-0.5">{pixCode}</p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full font-bold"
              onClick={handleCopyPix}
              leftIcon={<Copy size={16} />}
            >
              {copied ? "Código Pix Copiado!" : "Copiar Código Pix"}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Alterar Cartão */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Cartão de Faturamento</h3>
                <p className="text-xs text-slate-500">Cobrança recorrente da mensalidade de R$ 500/mês.</p>
              </div>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <Input label="Número do Cartão" placeholder="0000 0000 0000 0000" defaultValue="•••• •••• •••• 8842" />
              <Input label="Nome no Cartão" placeholder="Como impresso no cartão" defaultValue="AUTO MECANICA BARRA LTDA" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Validade" placeholder="MM/AA" defaultValue="11/29" />
                <Input label="CVV" placeholder="123" defaultValue="•••" type="password" />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsCardModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCardSaved(true);
                  setTimeout(() => {
                    setCardSaved(false);
                    setIsCardModalOpen(false);
                  }, 800);
                }}
              >
                {cardSaved ? "Salvo!" : "Atualizar Cartão"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
