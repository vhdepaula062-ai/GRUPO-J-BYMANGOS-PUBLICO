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

import { registerPartnerWorkshopAction } from "./actions";

export default function SejaParceiroPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    responsibleName: "",
    tradeName: "",
    cnpj: "",
    phone: "",
    email: "",
    city: "",
    state: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerPartnerWorkshopAction(formData);
    setIsLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.message);
    }
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
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <Input
                  label="Nome Completo do Responsável"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={formData.responsibleName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, responsibleName: e.target.value }))}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Oficina / Fantasia"
                    required
                    placeholder="Ex: Auto Center Progresso"
                    prefixIcon={<Building2 size={16} />}
                    value={formData.tradeName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tradeName: e.target.value }))}
                  />
                  <Input
                    label="CNPJ"
                    required
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telefone / WhatsApp"
                    required
                    placeholder="(11) 99999-9999"
                    prefixIcon={<Phone size={16} />}
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    label="E-mail Comercial"
                    type="email"
                    required
                    placeholder="contato@oficina.com.br"
                    prefixIcon={<Mail size={16} />}
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Cidade"
                      required
                      placeholder="São Paulo"
                      prefixIcon={<MapPin size={16} />}
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Input
                      label="UF"
                      required
                      maxLength={2}
                      placeholder="SP"
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>

                {/* Resumo Transparente da Parceria */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-slate-600 mt-2">
                  <span className="text-[#034EFE] font-bold text-base">ℹ</span>
                  <div className="leading-relaxed">
                    <strong className="text-slate-900 block font-bold">Plano B2B conforme catálogo vigente</strong>
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
