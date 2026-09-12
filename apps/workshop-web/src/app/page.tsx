import React from "react";
import Link from "next/link";
import { Button, Card, CardContent } from "@grupo-j/ui-web";

export default function WorkshopLandingPage() {
  return (
    <div className="min-h-screen bg-[#00091D] text-white flex flex-col">
      {/* Header Institucional */}
      <header className="h-20 border-b border-slate-800 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#034EFE] flex items-center justify-center font-bold text-white text-xl">
            J
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">GRUPO J</span>
            <span className="block text-[11px] text-blue-400 font-semibold tracking-widest uppercase">
              Rede de Centros Automotivos
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Acessar Painel da Oficina
          </Link>
          <Link href="/seja-parceiro">
            <Button variant="primary" size="sm">
              Seja Parceiro Credenciado
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span>Oportunidade de Parceria B2B</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Transforme seu Centro Automotivo com o <span className="text-[#034EFE]">Grupo J</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Receba um fluxo previsível e contínuo de motoristas particulares todos os meses.
          Integre nossa rede credenciada por apenas <strong>R$ 500,00/mês</strong> e fidelize clientes da sua região.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/seja-parceiro">
            <Button variant="primary" size="lg" className="text-base px-8 h-14">
              Quero Credenciar Minha Oficina
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="text-base px-8 h-14 border border-slate-700">
              Já sou Parceiro (Entrar)
            </Button>
          </Link>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <Card className="bg-slate-900/60 border-slate-800 text-white">
            <CardContent className="p-6">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="font-bold text-lg text-white">Fluxo Constante</h3>
              <p className="text-sm text-slate-400 mt-2">
                Motoristas com assinatura ativa de R$ 50/mês escolhem sua oficina para serviços preventivos regulares.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-white">
            <CardContent className="p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold text-lg text-white">Oportunidade de Upsell</h3>
              <p className="text-sm text-slate-400 mt-2">
                Ao inspecionar o veículo na revisão preventiva, sua equipe identifica e orça serviços corretivos adicionais.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-white">
            <CardContent className="p-6">
              <div className="text-3xl mb-3">💻</div>
              <h3 className="font-bold text-lg text-white">SaaS Exclusivo</h3>
              <p className="text-sm text-slate-400 mt-2">
                Sistema web completo para check-in instantâneo, validação de voucher por QR code e histórico de clientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Grupo J — Todos os direitos reservados.
      </footer>
    </div>
  );
}
