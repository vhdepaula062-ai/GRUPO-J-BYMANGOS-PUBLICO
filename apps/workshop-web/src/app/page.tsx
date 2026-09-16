"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import {
  GrupoJLogo,
  Button,
  Badge,
  Shield,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  MapPin,
  FileText,
  TrendingUp,
  Users,
  Award,
  StaggerContainer,
  StaggerItem,
  TiltCard,
  AnimatedCounter,
  MagneticButton,
  CarHeroGraphic,
  useMotionCapabilities
} from "@grupo-j/ui-web";
import { MotionBlurReveal, VelocityScrollAtmosphere } from "@/components/MotionBlurReveal";

export default function WorkshopLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTabVisible, setIsTabVisible] = useState(true);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const { supports3D } = useMotionCapabilities();
  const { scrollYProgress } = useScroll();

  // 1. Detecção suave de scroll para o cabeçalho
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Pausar microanimações quando a aba estiver em segundo plano
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 3. Parallax sutil de ponteiro no elemento circular do carro (somente desktop)
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!supports3D || !heroVisualRef.current) return;
    const rect = heroVisualRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    // Limita inclinação a no máximo 2.5 graus
    setMousePos({ x: Math.max(Math.min(x * 2.5, 2.5), -2.5), y: Math.max(Math.min(y * 2.5, 2.5), -2.5) });
  };

  const handleHeroMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#034EFE] selection:text-white relative scroll-smooth">
      {/* Aura de desfoque atmosférico sensível à velocidade de scroll */}
      <VelocityScrollAtmosphere />

      {/* Barra de Progresso de Leitura Superior Conectada ao Scroll */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#034EFE] via-blue-400 to-[#034EFE] origin-left z-50 pointer-events-none"
      />

      {/* 1. Header / Navbar Institucional com Glassmorphism Translúcido */}
      <header
        className={`h-20 px-4 sm:px-8 lg:px-16 flex items-center justify-between sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/75 backdrop-blur-xl border-b border-white/80 shadow-sm shadow-blue-900/5"
            : "bg-white/50 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Grupo J Início">
            <GrupoJLogo variant="light" subtitle="AUTO CENTER" size="md" />
          </Link>
        </div>

        {/* Links Centrais de Navegação Desktop com Underline Animado */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#como-funciona" className="nav-link-animated hover:text-[#034EFE] transition-colors">
            Como Funciona
          </a>
          <a href="#motoristas" className="nav-link-animated hover:text-[#034EFE] transition-colors">
            Para Motoristas
          </a>
          <a href="#oficinas" className="nav-link-animated hover:text-[#034EFE] transition-colors">
            Para Oficinas
          </a>
          <a href="#diferenciais" className="nav-link-animated hover:text-[#034EFE] transition-colors">
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
            <Button variant="outline" size="sm" className="hidden lg:inline-flex bg-white/70 backdrop-blur-sm">
              Seja Parceiro
            </Button>
          </Link>
          <a href="#motoristas">
            <Button variant="primary" size="sm" className="shadow-md shadow-blue-600/20">
              Baixar App
            </Button>
          </a>
        </div>
      </header>

      {/* 2. Hero Section Principal com Tipografia 100% Nítida e Glassmorphism */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        {/* Luzes difusas de ambiente suaves */}
        <div className="ambient-glow-blue w-96 h-96 -top-20 -left-20 opacity-60" />
        <div className="ambient-glow-blue w-96 h-96 top-40 -right-20 opacity-40" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna Esquerda: Texto Nítido, CTAs e Métricas */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <MotionBlurReveal direction="down" distance={12} duration={0.5} initialBlur={6}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/80 text-[#034EFE] text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                <Shield size={14} />
                <span>Prevenção Veicular por Assinatura</span>
              </div>
            </MotionBlurReveal>

            {/* Título Principal com transição de Motion Blur suave */}
            <MotionBlurReveal delay={0.06} duration={0.6} initialBlur={12} distance={24}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#00091D] leading-[1.12]">
                Seu carro cuidado todo mês,{" "}
                <span className="text-[#034EFE] underline decoration-blue-300 underline-offset-8">
                  sem surpresas
                </span>
              </h1>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.12} duration={0.6} initialBlur={8} distance={20}>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                O Grupo J conecta você aos melhores Auto Centers com um plano mensal de prevenção
                veicular. Manutenção em dia, economia garantida e tranquilidade ao dirigir.
              </p>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.18} duration={0.6} initialBlur={10} distance={20}>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <MagneticButton maxDistance={6}>
                  <a href="#motoristas" className="w-full sm:w-auto inline-block">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto h-13 px-8 text-base shadow-lg shadow-blue-600/25"
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Quero cuidar do meu carro
                    </Button>
                  </a>
                </MagneticButton>
                <Link href="/seja-parceiro">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-6 text-base bg-white/80 backdrop-blur-sm border-slate-200/80">
                    Quero ser um Auto Center parceiro
                  </Button>
                </Link>
              </div>
            </MotionBlurReveal>

            {/* Linha de Estatísticas Chave com Contadores Animados */}
            <MotionBlurReveal delay={0.24} duration={0.6} initialBlur={10} distance={20}>
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">
                    <AnimatedCounter value={50} prefix="R$ " duration={1.1} />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">/mês para motoristas</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">
                    <AnimatedCounter value={4} duration={0.9} />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">serviços inclusos</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-[#034EFE] tracking-tight">
                    <AnimatedCounter value={100} suffix="%" duration={1.2} />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">prevenção ativa</p>
                </div>
              </div>
            </MotionBlurReveal>
          </div>

          {/* Coluna Direita: Composição Automotiva Premium com Glassmorphism e Tags Flutuantes */}
          <div
            className="lg:col-span-5 flex items-center justify-center relative perspective-1000"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
          >
            {/* Círculo Principal com efeito Glassmorphism Fosco */}
            <div
              ref={heroVisualRef}
              style={{
                transform: supports3D
                  ? `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`
                  : "none",
                transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)"
              }}
              className={`relative w-80 sm:w-96 h-80 sm:h-96 rounded-full border-2 border-white/80 bg-gradient-to-b from-white/90 via-blue-50/40 to-white/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 flex items-center justify-center p-8 preserve-3d ${
                isTabVisible ? "animate-float-slow" : ""
              }`}
            >
              {/* Anel orbital interno decorativo */}
              <div className="absolute inset-4 rounded-full border border-blue-200/40 pointer-events-none" />

              {/* Ilustração Vetorial Automotiva de Alta Precisão */}
              <div className="relative z-10">
                <CarHeroGraphic size={250} />
              </div>

              {/* Tag Flutuante 1 (Alinhamento & Convergência) */}
              <div
                className={`absolute -top-4 left-2 sm:-left-4 glass-pill px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 flex items-center gap-2.5 whitespace-nowrap z-20 transition-transform duration-300 hover:scale-105 ${
                  isTabVisible ? "animate-float-tag-1" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Alinhamento (Convergência) <span className="text-slate-400 font-normal">(Incluso)</span>
                </span>
              </div>

              {/* Tag Flutuante 2 (Balanceamento) */}
              <div
                className={`absolute top-6 -right-6 sm:-right-12 glass-pill px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 flex items-center gap-2.5 whitespace-nowrap z-20 transition-transform duration-300 hover:scale-105 ${
                  isTabVisible ? "animate-float-tag-2" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Balanceamento <span className="text-slate-400 font-normal">(Incluso)</span>
                </span>
              </div>

              {/* Tag Flutuante 3 (Higienização A/C) */}
              <div
                className={`absolute -bottom-4 left-2 sm:left-4 glass-pill px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 flex items-center gap-2.5 whitespace-nowrap z-20 transition-transform duration-300 hover:scale-105 ${
                  isTabVisible ? "animate-float-tag-3" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Higienização A/C <span className="text-slate-400 font-normal">(Incluso)</span>
                </span>
              </div>

              {/* Tag Flutuante 4 (Rodízio de Pneus) */}
              <div
                className={`absolute bottom-8 -right-6 sm:-right-10 glass-pill px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 flex items-center gap-2.5 whitespace-nowrap z-20 transition-transform duration-300 hover:scale-105 ${
                  isTabVisible ? "animate-float-tag-1" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Rodízio de Pneus <span className="text-slate-400 font-normal">(Incluso)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Como Funciona o Grupo J — Cards em Glassmorphism Translúcido com Motion Blur */}
      <section id="como-funciona" className="py-20 bg-white/60 backdrop-blur-md border-y border-slate-200/80 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <MotionBlurReveal duration={0.6} initialBlur={12} distance={24}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00091D] tracking-tight">
              Como funciona o Grupo J
            </h2>
          </MotionBlurReveal>
          <MotionBlurReveal delay={0.08} duration={0.6} initialBlur={8} distance={20}>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Em 4 passos simples, você garante a prevenção do seu veículo com tranquilidade e economia.
            </p>
          </MotionBlurReveal>

          <MotionBlurReveal delay={0.15} duration={0.7} initialBlur={14} distance={28}>
            <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 text-left">
              {/* Passo 1 */}
              <StaggerItem>
                <div className="glass-panel-interactive rounded-2xl p-6 relative pt-7">
                  <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow-md">
                    1
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <Smartphone size={20} />
                    </div>
                    <h3 className="font-bold text-base text-[#00091D]">Baixe o app</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Disponível para iOS e Android. Cadastro rápido e seguro com seus dados veiculares.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              {/* Passo 2 */}
              <StaggerItem>
                <div className="glass-panel-interactive rounded-2xl p-6 relative pt-7">
                  <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow-md">
                    2
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h3 className="font-bold text-base text-[#00091D]">Escolha seu Auto Center</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Selecione a oficina parceira credenciada mais conveniente para a sua rotina.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              {/* Passo 3 */}
              <StaggerItem>
                <div className="glass-panel-interactive rounded-2xl p-6 relative pt-7">
                  <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow-md">
                    3
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <Wrench size={20} />
                    </div>
                    <h3 className="font-bold text-base text-[#00091D]">Use os serviços do plano</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Aproveite os serviços preventivos inclusos na sua mensalidade fixa de R$ 50/mês.
                    </p>
                  </div>
                </div>
              </StaggerItem>

              {/* Passo 4 */}
              <StaggerItem>
                <div className="glass-panel-interactive rounded-2xl p-6 relative pt-7">
                  <div className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-[#034EFE] text-white font-black text-sm flex items-center justify-center shadow-md">
                    4
                  </div>
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-bold text-base text-[#00091D]">Acompanhe tudo</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Histórico completo de revisões e manutenções do veículo sempre disponível na palma da mão.
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </MotionBlurReveal>
        </div>
      </section>

      {/* 4. Seção Para Motoristas com Glassmorphism e Tilt 3D */}
      <section id="motoristas" className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <MotionBlurReveal direction="left" distance={16} duration={0.5} initialBlur={6}>
              <Badge variant="info" size="md">
                Para Motoristas
              </Badge>
            </MotionBlurReveal>

            {/* Título com Motion Blur */}
            <MotionBlurReveal delay={0.06} duration={0.6} initialBlur={12} distance={24}>
              <h2 className="text-3xl sm:text-4xl font-black text-[#00091D] tracking-tight leading-tight">
                Tudo que seu carro precisa por apenas{" "}
                <span className="text-[#034EFE]">R$ 50/mês</span>
              </h2>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.12} duration={0.6} initialBlur={8} distance={20}>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Com o Grupo J, você tem acesso a serviços essenciais de prevenção veicular,
                atendimento de qualidade e o histórico completo do seu veículo sempre à mão.
              </p>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.18} duration={0.6} initialBlur={10} distance={20}>
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
                    <span>Alinhamento (convergência)</span>
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
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.24} duration={0.6} initialBlur={10} distance={20}>
              <div className="pt-4 flex flex-wrap gap-3">
                <Button variant="primary" size="md" leftIcon={<Smartphone size={18} />} className="shadow-md shadow-blue-600/20">
                  Baixar na App Store
                </Button>
                <Button variant="primary" size="md" leftIcon={<Smartphone size={18} />} className="shadow-md shadow-blue-600/20">
                  Baixar no Google Play
                </Button>
              </div>
            </MotionBlurReveal>
          </div>

          {/* 4 Cards de Benefícios com Glassmorphism Translúcido e Motion Blur */}
          <div className="lg:col-span-6">
            <MotionBlurReveal delay={0.12} duration={0.7} initialBlur={14} distance={28}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <TiltCard>
                  <div className="glass-panel rounded-2xl p-5 space-y-2 h-full transition-all duration-300 hover:border-blue-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <Wrench size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-[#00091D]">Atendimento no mesmo dia</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Agende pelo app e seja atendido rapidamente na oficina credenciada.
                    </p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel rounded-2xl p-5 space-y-2 h-full transition-all duration-300 hover:border-blue-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-[#00091D]">Histórico completo no app</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Todas as manutenções e ordens registradas em um só lugar digital.
                    </p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel rounded-2xl p-5 space-y-2 h-full transition-all duration-300 hover:border-blue-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-[#00091D]">Mais economia</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Previsibilidade de gastos e prevenção de problemas mecânicos maiores.
                    </p>
                  </div>
                </TiltCard>

                <TiltCard>
                  <div className="glass-panel rounded-2xl p-5 space-y-2 h-full transition-all duration-300 hover:border-blue-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                      <Shield size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-[#00091D]">Prevenção, não correção</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Cuide do carro de forma planejada antes que surjam defeitos inesperados.
                    </p>
                  </div>
                </TiltCard>
              </div>
            </MotionBlurReveal>
          </div>
        </div>
      </section>

      {/* 5. Seção Azul-Marinho Exclusiva para Oficinas com Motion Blur */}
      <section id="oficinas" className="relative py-20 bg-[#00091D] text-white px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Glow azul difuso de fundo */}
        <div className="absolute inset-0 navy-diffuse-glow pointer-events-none opacity-70" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Lista de Vantagens da Oficina com Motion Blur */}
          <div className="lg:col-span-6">
            <MotionBlurReveal delay={0.1} duration={0.7} initialBlur={14} distance={28}>
              <StaggerContainer staggerDelay={0.07} className="space-y-3.5 text-left">
                <StaggerItem>
                  <div className="p-4 rounded-2xl glass-panel-navy flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0 shadow-md">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Receita recorrente e previsível</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fluxo contínuo de clientes particulares todos os meses.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-2xl glass-panel-navy flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Clientes qualificados</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Motoristas que valorizam prevenção e cuidado ativo com o veículo.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-2xl glass-panel-navy flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Wrench size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Plataforma de gestão completa</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Controle de serviços, validação de voucher por QR Code e clientes em um só lugar.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="p-4 rounded-2xl glass-panel-navy flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl bg-[#034EFE] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Maior fidelização e upsell</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Relacionamento duradouro e oportunidade de orçar serviços corretivos adicionais.
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </MotionBlurReveal>
          </div>

          {/* Chamada B2B e Cartão de Mensalidade */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <MotionBlurReveal direction="right" distance={16} duration={0.5} initialBlur={6}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-blue-500/30">
                <span>Para Auto Centers & Oficinas</span>
              </div>
            </MotionBlurReveal>

            {/* Título com Motion Blur */}
            <MotionBlurReveal delay={0.06} duration={0.6} initialBlur={12} distance={24}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Transforme sua oficina em um{" "}
                <span className="text-[#034EFE]">centro de prevenção</span>
              </h2>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.12} duration={0.6} initialBlur={8} distance={20}>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                O Grupo J gera fluxo contínuo de clientes qualificados, previsibilidade de faturamento
                e um relacionamento duradouro com motoristas que cuidam do seu patrimônio.
              </p>
            </MotionBlurReveal>

            {/* Cartão de Investimento Mensal B2B de R$ 500 */}
            <MotionBlurReveal delay={0.18} duration={0.6} initialBlur={12} distance={20}>
              <div className="p-6 rounded-2xl glass-panel-navy flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:border-blue-400/60 shadow-xl">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                    Investimento Mensal B2B
                  </span>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Para fazer parte da rede credenciada Grupo J e receber clientes vinculados.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-3xl font-black text-white tracking-tight">
                    <AnimatedCounter value={500} prefix="R$ " duration={1.2} />
                  </p>
                  <span className="text-xs text-blue-400 font-semibold">por mês</span>
                </div>
              </div>
            </MotionBlurReveal>

            <MotionBlurReveal delay={0.24} duration={0.6} initialBlur={10} distance={20}>
              <div>
                <MagneticButton maxDistance={6}>
                  <Link href="/seja-parceiro" className="inline-block">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto h-13 px-8 text-base shadow-lg shadow-blue-600/30"
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Quero ser parceiro Grupo J
                    </Button>
                  </Link>
                </MagneticButton>
              </div>
            </MotionBlurReveal>
          </div>
        </div>
      </section>

      {/* 6. Por que Escolher o Grupo J com Cards Glassmorphism e Motion Blur */}
      <section id="diferenciais" className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full text-center space-y-4">
        <MotionBlurReveal duration={0.6} initialBlur={12} distance={24}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00091D] tracking-tight">
            Por que escolher o Grupo J?
          </h2>
        </MotionBlurReveal>
        <MotionBlurReveal delay={0.08} duration={0.6} initialBlur={8} distance={20}>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Um modelo inovador que transforma a relação entre motoristas e oficinas com transparência e tecnologia.
          </p>
        </MotionBlurReveal>

        <MotionBlurReveal delay={0.15} duration={0.7} initialBlur={14} distance={28}>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <StaggerItem>
              <div className="glass-panel-interactive rounded-2xl p-6 space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Modelo de prevenção</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Não apenas manutenção, mas cuidado preventivo contínuo que evita problemas futuros e custos inesperados.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel-interactive rounded-2xl p-6 space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Relação ganha-ganha</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  O cliente economiza e fica tranquilo com o carro em dia; a oficina obtém receita previsível e clientes fiéis.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-panel-interactive rounded-2xl p-6 space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-bold text-base text-[#00091D]">Plataforma digital intuitiva</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  App simples e fácil de usar para motoristas e portal web SaaS completo com check-in rápido para parceiros.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </MotionBlurReveal>

        {/* 7. Banner de Citação Oficial (Jotinha) com Motion Blur */}
        <div className="pt-12 max-w-4xl mx-auto">
          <MotionBlurReveal delay={0.12} distance={20} duration={0.65} initialBlur={16}>
            <div className="bg-[#034EFE] text-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-blue-500/15 space-y-4 text-center transition-transform duration-300 hover:scale-[1.01]">
              <div className="text-3xl opacity-80 select-none">❝</div>
              <blockquote className="text-xl sm:text-2xl font-bold tracking-tight leading-relaxed max-w-2xl mx-auto">
                “Mais controle para quem dirige. Mais movimento para quem vive da oficina.”
              </blockquote>
              <div className="pt-2">
                <p className="font-extrabold text-sm tracking-wide">Jotinha</p>
                <p className="text-xs text-blue-200 uppercase tracking-wider">Fundador do Grupo J</p>
              </div>
            </div>
          </MotionBlurReveal>
        </div>
      </section>

      {/* 8. Rodapé Institucional com Vidro Suave e Motion Blur */}
      <footer className="bg-white/70 backdrop-blur-md border-t border-slate-200/80 py-12 px-4 sm:px-8 lg:px-16">
        <MotionBlurReveal duration={0.6} initialBlur={8} distance={16}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <GrupoJLogo variant="light" size="sm" />
              <span className="border-l border-slate-300 pl-3">
                Rede Nacional de Centros Automotivos
              </span>
            </div>

            <div className="flex items-center gap-6 font-semibold">
              <Link href="/seja-parceiro" className="nav-link-animated hover:text-[#034EFE]">
                Seja Parceiro
              </Link>
              <Link href="/login" className="nav-link-animated hover:text-[#034EFE]">
                Portal da Oficina
              </Link>
              <a href="#motoristas" className="nav-link-animated hover:text-[#034EFE]">
                Baixar App Motorista
              </a>
            </div>

            <p>© {new Date().getFullYear()} Grupo J. Todos os direitos reservados.</p>
          </div>
        </MotionBlurReveal>
      </footer>
    </div>
  );
}
