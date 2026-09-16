"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkshopNavbar } from "./WorkshopNavbar";
import {
  GrupoJLogo,
  TrendingUp,
  Zap,
  Users,
  Calendar,
  Wrench,
  Tag,
  Receipt,
  FileText,
  Settings,
  HelpCircle,
  Shield,
  Avatar,
  X,
  LogOut
} from "@grupo-j/ui-web";

const workshopNav = [
  { name: "Painel da Oficina", href: "/painel", icon: <TrendingUp size={18} /> },
  { name: "Check-in Rápido", href: "/check-in", icon: <Zap size={18} className="text-amber-400" />, badge: "120s" },
  { name: "Clientes Vinculados", href: "/clientes", icon: <Users size={18} /> },
  { name: "Agenda de Serviços", href: "/agenda", icon: <Calendar size={18} /> },
  { name: "Serviços Realizados", href: "/servicos", icon: <Wrench size={18} /> },
  { name: "Minhas Promoções", href: "/promocoes", icon: <Tag size={18} /> },
  { name: "Equipe & Mecânicos", href: "/equipe", icon: <Users size={18} /> },
  { name: "Mensalidade (R$ 500)", href: "/mensalidade", icon: <Receipt size={18} />, badge: "Em dia" },
  { name: "Relatórios", href: "/relatorios", icon: <FileText size={18} /> },
  { name: "Configurações", href: "/configuracoes", icon: <Settings size={18} /> },
  { name: "Suporte Grupo J", href: "/suporte", icon: <HelpCircle size={18} /> }
];

export function WorkshopShell({
  children,
  workshopName = "Oficina Parceira",
  workshopSubtitle = "Rede Credenciada",
  locationName = "Rede Credenciada Grupo J"
}: {
  children: React.ReactNode;
  workshopName?: string;
  workshopSubtitle?: string;
  locationName?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar (visível apenas em telas grandes lg:) */}
      <aside className="hidden lg:flex w-64 bg-[#00091D] text-slate-300 flex-col flex-shrink-0 min-h-screen border-r border-[#13254A] select-none z-30">
        <div className="h-18 px-5 py-4 border-b border-[#13254A] flex items-center justify-between">
          <GrupoJLogo variant="dark" subtitle="OFICINA PARCEIRA" size="md" />
        </div>

        <div className="px-4 py-2 bg-[#041129] border-b border-[#13254A] flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Shield size={12} className="text-emerald-400" />
            Oficina Homologada
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {workshopNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/painel" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#034EFE] text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-[#071739]"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#13254A] text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#13254A] bg-[#020B1F]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#071739] border border-[#13254A]">
            <Avatar name={workshopName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{workshopName}</p>
              <p className="text-[10px] text-slate-400 truncate">{workshopSubtitle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Slide-over (Menu Hamburguer para celulares e tablets) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Escuro */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Gaveta Lateral Deslizante */}
          <div className="relative w-72 max-w-[85vw] bg-[#00091D] text-slate-300 flex flex-col h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {/* Cabeçalho da Gaveta */}
            <div className="h-16 px-4 border-b border-[#13254A] flex items-center justify-between">
              <GrupoJLogo variant="dark" subtitle="PORTAL DO PARCEIRO" size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#13254A]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links da Gaveta Mobile */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {workshopNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/painel" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#034EFE] text-white shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:text-white hover:bg-[#071739]"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#13254A] text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Ações Rápidas Mobile */}
            <div className="p-4 border-t border-[#13254A] bg-[#020B1F] space-y-2.5">
              <Link
                href="/check-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 px-3 rounded-xl bg-[#034EFE] text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                ⚡ Validar Voucher de Motorista
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                <LogOut size={14} />
                <span>Sair da Oficina</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal com Barra Superior Responsiva */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <WorkshopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} locationName={locationName} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
