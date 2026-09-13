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
  Input,
  Button,
  CheckCircle2,
  MessageSquare,
  HelpCircle
} from "@grupo-j/ui-web";

export default function SuporteOficinaPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [protocol, setProtocol] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const fakeProtocol = `GJ-SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    setProtocol(fakeProtocol);
    setSubject("");
    setDescription("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Canal Direto de Suporte Grupo J"
        subtitle="Atendimento prioritário para proprietários e gerentes de oficinas credenciadas na rede."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card Contato Imediato WhatsApp */}
        <div className="bg-gradient-to-br from-[#00091D] to-[#041129] p-6 rounded-2xl border border-[#13254A] text-white flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Plantão Técnico Ativo
            </span>
            <h3 className="text-xl font-black text-white mt-1">WhatsApp da Matriz</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Suporte em tempo real para dúvidas operacionais de check-in, divergências de placas ou faturamento.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-900/60 text-xs">
              <p className="text-slate-400">Atendimento:</p>
              <p className="font-bold text-white">Segunda a Sábado, das 07h às 19h</p>
            </div>

            <a
              href="https://wa.me/5511999998888?text=Olá,%20sou%20da%20oficina%20credenciada%20Grupo%20J%20e%20preciso%20de%20suporte."
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 border-none shadow-lg shadow-emerald-900/20"
                leftIcon={<MessageSquare size={16} />}
              >
                Falar com a Matriz no WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Formulário de Abertura de Chamado */}
        <div className="md:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <div>
                <CardTitle>Abrir Chamado Interno</CardTitle>
                <CardDescription>Envie solicitações que exijam análise fiscal, cadastral ou contratual.</CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmitTicket}>
              <CardContent className="space-y-4">
                {protocol && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      Chamado Aberto com Sucesso!
                    </div>
                    <p>
                      Seu protocolo é: <strong className="font-mono">{protocol}</strong>. Nossa equipe de governança responderá em até 2 horas.
                    </p>
                  </div>
                )}

                <Input
                  label="Assunto do Chamado"
                  required
                  placeholder="Ex: Divergência na liquidação do voucher GJ-94021"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Categoria
                    </label>
                    <select className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#034EFE]">
                      <option>Faturamento e Repasses Financeiros</option>
                      <option>Dúvida sobre Validação de Voucher</option>
                      <option>Alteração Cadastral ou CNPJ</option>
                      <option>Suporte ao Mecânico / Pista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Prioridade
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#034EFE]"
                    >
                      <option value="normal">Normal (Até 24h)</option>
                      <option value="alta">Alta (Cliente na Oficina)</option>
                      <option value="urgente">Urgente (Sistema Fora do Ar)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Descrição Detalhada
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva detalhadamente o ocorrido com placa do veículo ou código do voucher se aplicável..."
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#034EFE]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-0">
                <Button variant="primary" size="md" type="submit" className="font-bold">
                  Registrar Chamado
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Dúvidas Frequentes da Rede de Oficinas */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-[#034EFE]" />
            <CardTitle>Perguntas Frequentes dos Centros Automotivos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 divide-y divide-slate-100">
          <div className="pt-2">
            <h4 className="font-bold text-sm text-slate-900">Como e quando a oficina recebe o repasse dos atendimentos?</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              O repasse fixo de R$ 50,00 por serviço preventivo executado é consolidado semanalmente e transferido via Pix diretamente para a conta bancária jurídica vinculada ao CNPJ do centro automotivo.
            </p>
          </div>
          <div className="pt-3">
            <h4 className="font-bold text-sm text-slate-900">O que fazer se o cliente chegar sem sinal de internet no celular?</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              O aplicativo do motorista gera o token do voucher em modo offline com segurança criptográfica baseada em tempo (TOTP). Basta o motorista mostrar o código no app e o atendente digita no validador da oficina.
            </p>
          </div>
          <div className="pt-3">
            <h4 className="font-bold text-sm text-slate-900">A oficina pode orçar peças e serviços corretivos durante a revisão?</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sim, com total liberdade! O modelo do Grupo J incentiva o upsell ético: a preventiva atrai o motorista qualificado até o seu box, e qualquer manutenção corretiva identificada no checklist (ex: troca de pastilhas, amortecedores, correia dentada) é orçada diretamente pela sua oficina com 100% de margem retida por você.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
