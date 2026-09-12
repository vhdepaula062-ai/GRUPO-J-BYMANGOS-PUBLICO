"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GrupoJLogo,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Button,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  BlurReveal,
  Reveal
} from "@grupo-j/ui-web";

export default function SejaParceiroPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Cabeçalho de Navegação e Logo */}
      <Reveal direction="down" distance={12} className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#034EFE] transition-colors">
            <ArrowLeft size={16} />
            <span>Voltar ao Início</span>
          </Link>
          <GrupoJLogo variant="light" size="sm" />
        </div>
      </Reveal>

      <div className="w-full max-w-xl">
        <BlurReveal initialBlur={8} duration={0.4}>
          <Card variant="elevated" className="border border-slate-200/80 shadow-xl">
          {submitted ? (
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#00091D] tracking-tight">
                Proposta Enviada com Sucesso!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Agradecemos o interesse em integrar nossa rede. Nosso time de credenciamento
                entrará em contato pelo WhatsApp informado em até 24 horas úteis para validação dos dados
                e ativação do seu acesso.
              </p>
              <div className="pt-6">
                <Link href="/">
                  <Button variant="primary" size="md">
                    Voltar para a Página Inicial
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader className="p-6 sm:p-8 pb-4 border-b border-slate-100 flex flex-col items-start gap-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#034EFE] text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck size={14} />
                  <span>Credenciamento de Auto Centers</span>
                </div>
                <CardTitle className="text-2xl font-extrabold text-[#00091D]">
                  Quero ser parceiro
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs sm:text-sm">
                  Preencha seus dados cadastrais para fazer parte da rede credenciada do Grupo J.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-4">
                <Input
                  label="Nome Completo do Responsável"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Oficina / Fantasia"
                    required
                    placeholder="Ex: Auto Center Progresso"
                    prefixIcon={<Building2 size={16} />}
                  />
                  <Input
                    label="CNPJ"
                    required
                    placeholder="00.000.000/0001-00"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telefone / WhatsApp"
                    required
                    placeholder="(11) 99999-9999"
                    prefixIcon={<Phone size={16} />}
                  />
                  <Input
                    label="E-mail Comercial"
                    type="email"
                    required
                    placeholder="contato@oficina.com.br"
                    prefixIcon={<Mail size={16} />}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Cidade"
                      required
                      placeholder="São Paulo"
                      prefixIcon={<MapPin size={16} />}
                    />
                  </div>
                  <div>
                    <Input label="UF" required maxLength={2} placeholder="SP" />
                  </div>
                </div>

                {/* Resumo Transparente da Parceria */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-slate-600 mt-2">
                  <span className="text-[#034EFE] font-bold text-base">ℹ</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-900 block font-bold">Mensalidade B2B de R$ 500,00/mês</strong>
                    Garante clientes qualificados vinculados na sua região, SaaS de check-in instantâneo e visibilidade no app móvel.
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 sm:p-8 pt-0 flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Enviar Proposta de Credenciamento
                </Button>
                <p className="text-[11px] text-center text-slate-400">
                  Ao enviar, você autoriza o contato de nossos especialistas para avaliação técnica.
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
        </BlurReveal>
      </div>
    </div>
  );
}
