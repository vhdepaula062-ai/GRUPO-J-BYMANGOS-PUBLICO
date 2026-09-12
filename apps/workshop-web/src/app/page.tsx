import React from "react";
import Link from "next/link";
import {
  GrupoJLogo,
  Button,
  Card,
  CardContent,
  Badge,
  Shield,
  Car,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  MapPin,
  FileText,
  TrendingUp,
  Users,
  Award
} from "@grupo-j/ui-web";

export default function WorkshopLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#034EFE] selection:text-white">
      {/* 1. Header / Navbar Institucional (Referência desgnref 8, 13) */}
      <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 lg:px-16 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Grupo J Início">
            <GrupoJLogo variant="light" subtitle="AUTO CENTER" size="md" />
          </Link>
        </div>

        {/* Links Centrais de Navegação Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#como-funciona" className="hover:text-[#034EFE] transition-colors">
            Como Funciona
          </a>
          <a href="#motoristas" className="hover:text-[#034EFE] transition-colors">
            Para Motoristas
          </a>
          <a href="#oficinas" className="hover:text-[#034EFE] transition-colors">
            Para Oficinas
          </a>
          <a href="#diferenciais" className="hover:text-[#034EFE] transition-colors">
            Diferenciais
          </a>
        </nav>

        {/* Ações Direita: Seja Parceiro & Acessar Painel */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-semibold text-slate-700">
              Acessar Painel
            </Button>
          </Link>
          <Link href="/seja-parceiro">
            <Button variant="outline" size="sm" className="hidden lg:inline-flex">
              Seja Parceiro
            </Button>
          </Link>
          <a href="#motoristas">
            <Button variant="primary" size="sm">
              Baixar App
            </Button>
          </a>
        </div>
      </header>

      {/* 2. Hero Section Principal (Referência desgnref 13) */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna Esquerda: Texto, CTAs e Métricas */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#034EFE] text-xs font-bold uppercase tracking-wider">
              <Shield size={14} />
              <span>Prevenção Veicular por Assinatura</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#00091D] leading-[1.12]">
              Seu carro cuidado todo mês,{" "}
              <span className="text-[#034EFE] underline decoration-blue-300 underline-offset-8">
                sem surpresas
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              O Grupo J conecta você aos melhores Auto Centers com um plano mensal de prevenção
              veicular. Manutenção em dia, economia garantida e tranquilidade ao dirigir.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a href="#motoristas">
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-13 px-8 text-base shadow-lg shadow-blue-600/20" rightIcon={<ArrowRight size={18} />}>
                  Quero cuidar do meu carro
                </Button>
              </a>
              <Link href="/seja-parceiro">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-6 text-base">
                  Quero ser um Auto Center parceiro
                </Button>
              </Link>
            </div>

            {/* Linha de Estatísticas Chave */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200/80 max-w-lg">
              <div>
                <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">R$ 50</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">/mês para motoristas</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">4</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">serviços inclusos</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">100%</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">prevenção ativa</p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Ilustração Conceitual com Tags Flutuantes */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-72 sm:w-88 h-72 sm:h-88 rounded-full border-8 border-blue-100 bg-white shadow-2xl flex items-center justify-center p-8">
              <Car size={96} className="text-[#034EFE] animate-pulse" />

              {/* Tags Flutuantes de Serviços Inclusos */}
              <div className="absolute -top-3 right-0 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Alinhamento <span className="text-slate-400 font-normal">(Incluso)</span></span>
              </div>

              <div className="absolute top-1/2 -right-6 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Balanceamento <span className="text-slate-400 font-normal">(Incluso)</span></span>
              </div>

              <div className="absolute -bottom-3 left-4 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Higienização A/C <span className="text-slate-400 font-normal">(Incluso)</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Como Funciona o Grupo J (Referência desgnref 14) */}
      <section id="como-funciona" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00091D] tracking-tight">
            Como funciona o Grupo J
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Em 4 passos simples, você garante a prevenção do seu veículo com tranquilidade e economia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-left">
            {/* Passo 1 */}
            <Card variant="elevated" className="relative pt-6">
              <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow">
                1
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Baixe o app</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Disponível para iOS e Android. Cadastro rápido e seguro com seus dados veiculares.
                </p>
              </CardContent>
            </Card>

            {/* Passo 2 */}
            <Card variant="elevated" className="relative pt-6">
              <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow">
                2
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Escolha seu Auto Center</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selecione a oficina parceira credenciada mais conveniente para a sua rotina.
                </p>
              </CardContent>
            </Card>

            {/* Passo 3 */}
            <Card variant="elevated" className="relative pt-6">
              <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow">
                3
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Wrench size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Use os serviços do plano</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Aproveite os serviços preventivos inclusos na sua mensalidade fixa de R$ 50/mês.
                </p>
              </CardContent>
            </Card>

            {/* Passo 4 */}
            <Card variant="elevated" className="relative pt-6">
              <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow">
                4
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Acompanhe tudo</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Histórico completo de revisões e manutenções do veículo sempre disponível na palma da mão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Seção Para Motoristas (Referência desgnref 8) */}
      <section id="motoristas" className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <Badge variant="info" size="md">
              Para Motoristas
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-black text-[#00091D] tracking-tight leading-tight">
              Tudo que seu carro precisa por apenas{" "}
              <span className="text-[#034EFE]">R$ 50/mês</span>
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Com o Grupo J, você tem acesso a serviços essenciais de prevenção veicular,
              atendimento de qualidade e o histórico completo do seu veículo sempre à mão.
            </p>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Serviços inclusos no plano mensal:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#034EFE]" />
                  <span>Balanceamento de pneus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#034EFE]" />
                  <span>Alinhamento e convergência</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#034EFE]" />
                  <span>Higienização de ar-condicionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#034EFE]" />
                  <span>Rodízio de pneus</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Button variant="primary" size="md" leftIcon={<Smartphone size={18} />}>
                Baixar na App Store
              </Button>
              <Button variant="primary" size="md" leftIcon={<Smartphone size={18} />}>
                Baixar no Google Play
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <Card variant="elevated">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Wrench size={18} />
                </div>
                <h4 className="font-bold text-sm text-[#00091D]">Atendimento no mesmo dia</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Agende pelo app e seja atendido rapidamente na oficina credenciada.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <h4 className="font-bold text-sm text-[#00091D]">Histórico completo no app</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Todas as manutenções e ordens registradas em um só lugar digital.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <h4 className="font-bold text-sm text-[#00091D]">Mais economia</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Previsibilidade de gastos e prevenção de problemas mecânicos maiores.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h4 className="font-bold text-sm text-[#00091D]">Prevenção, não correção</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cuide do carro de forma planejada antes que surjam defeitos inesperados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Seção Azul-Marinho Exclusiva para Oficinas (Referência desgnref 9) */}
      <section id="oficinas" className="py-20 bg-[#00091D] text-white px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lista de Vantagens da Oficina */}
          <div className="lg:col-span-6 space-y-3.5 text-left">
            <div className="p-4 rounded-2xl bg-[#041129] border border-[#13254A] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Receita recorrente e previsível</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fluxo contínuo de clientes particulares todos os meses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#041129] border border-[#13254A] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Clientes qualificados</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Motoristas que valorizam prevenção e cuidado ativo com o veículo.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#041129] border border-[#13254A] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0">
                <Wrench size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Plataforma de gestão completa</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controle de serviços, validação de voucher por QR Code e clientes em um só lugar.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#041129] border border-[#13254A] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Maior fidelização e upsell</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Relacionamento duradouro e oportunidade de orçar serviços corretivos adicionais.
                </p>
              </div>
            </div>
          </div>

          {/* Chamada B2B e Cartão de Mensalidade */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span>Para Auto Centers & Oficinas</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Transforme sua oficina em um{" "}
              <span className="text-[#034EFE]">centro de prevenção</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              O Grupo J gera fluxo contínuo de clientes qualificados, previsibilidade de faturamento
              e um relacionamento duradouro com motoristas que cuidam do seu patrimônio.
            </p>

            {/* Cartão de Investimento Mensal Atualizado para R$ 500 */}
            <div className="p-6 rounded-2xl bg-[#041129] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Investimento Mensal B2B
                </span>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Para fazer parte da rede credenciada Grupo J e receber clientes vinculados.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-3xl font-black text-white tracking-tight">R$ 500</p>
                <span className="text-xs text-blue-400 font-semibold">por mês</span>
              </div>
            </div>

            <div>
              <Link href="/seja-parceiro">
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-13 px-8 text-base" rightIcon={<ArrowRight size={18} />}>
                  Quero ser parceiro Grupo J
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Por que Escolher o Grupo J (Referência desgnref 10) */}
      <section id="diferenciais" className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00091D] tracking-tight">
          Por que escolher o Grupo J?
        </h2>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Um modelo inovador que transforma a relação entre motoristas e oficinas com transparência e tecnologia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <Card variant="elevated">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-base text-[#00091D]">Modelo de prevenção</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Não apenas manutenção, mas cuidado preventivo contínuo que evita problemas futuros e custos inesperados.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-base text-[#00091D]">Relação ganha-ganha</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                O cliente economiza e fica tranquilo com o carro em dia; a oficina obtém receita previsível e clientes fiéis.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <h3 className="font-bold text-base text-[#00091D]">Plataforma digital intuitiva</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                App simples e fácil de usar para motoristas e portal web SaaS completo com check-in rápido para parceiros.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 7. Banner de Citação Oficial (Referência desgnref 11) */}
        <div className="pt-12 max-w-4xl mx-auto">
          <div className="bg-[#034EFE] text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4 text-center">
            <div className="text-3xl opacity-80 select-none">❝</div>
            <blockquote className="text-xl sm:text-2xl font-bold tracking-tight leading-relaxed max-w-2xl mx-auto">
              “Mais controle para quem dirige. Mais movimento para quem vive da oficina.”
            </blockquote>
            <div className="pt-2">
              <p className="font-extrabold text-sm tracking-wide">Jotinha</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">Fundador do Grupo J</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Rodapé Institucional Completo */}
      <footer className="bg-white border-t border-slate-200/80 py-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <GrupoJLogo variant="light" size="sm" />
            <span className="border-l border-slate-300 pl-3">
              Rede Nacional de Centros Automotivos
            </span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/seja-parceiro" className="hover:text-[#034EFE]">
              Seja Parceiro
            </Link>
            <Link href="/login" className="hover:text-[#034EFE]">
              Portal da Oficina
            </Link>
            <a href="#motoristas" className="hover:text-[#034EFE]">
              Baixar App Motorista
            </a>
          </div>

          <p>© {new Date().getFullYear()} Grupo J. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
