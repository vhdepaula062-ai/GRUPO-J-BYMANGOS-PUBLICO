"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button } from "@grupo-j/ui-web";

export default function SejaParceiroPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#00091D] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase mb-3 hover:underline">
            ← Voltar para o Início
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Credenciamento de Oficina</h1>
          <p className="text-sm text-slate-400 mt-1">Preencha os dados da sua empresa para análise cadastral da equipe Grupo J.</p>
        </div>

        <Card className="bg-white border-slate-800 shadow-2xl">
          {submitted ? (
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900">Solicitação Enviada com Sucesso!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Nossa equipe comercial entrará em contato em até 24 horas úteis para homologação dos documentos e ativação do seu SaaS exclusivo de oficina.
              </p>
              <div className="pt-4">
                <Link href="/">
                  <Button variant="primary">Voltar para a Página Inicial</Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Dados Cadastrais da Oficina</CardTitle>
                <CardDescription>
                  Mensalidade fixa de R$ 500,00 após aprovação cadastral e assinatura do contrato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Razão Social" required placeholder="Auto Mecânica Silva LTDA" />
                <Input label="Nome Fantasia" required placeholder="Auto Center Silva" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="CNPJ" required placeholder="00.000.000/0001-00" />
                  <Input label="Telefone / WhatsApp Comercial" required placeholder="(11) 99999-9999" />
                </div>
                <Input label="E-mail de Contato" type="email" required placeholder="contato@autocenter.com.br" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input label="Cidade" required placeholder="São Paulo" />
                  </div>
                  <div>
                    <Input label="UF" required maxLength={2} placeholder="SP" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" variant="primary" className="w-full">
                  Enviar Solicitação de Credenciamento
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Ao enviar, você concorda com nossos termos de cooperação comercial e política de privacidade.
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
