"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Avatar
} from "@grupo-j/ui-web";

const workshopNav = [
  { name: "Painel da Oficina", href: "/painel", icon: <TrendingUp size={18} /> },
  { name: "Check-in Rápido", href: "/check-in", icon: <Zap size={18} className="text-amber-400" />, badge: "10min" },
  { name: "Clientes Vinculados", href: "/clientes", icon: <Users size={18} /> },
  { name: "Agenda de Serviços", href: "/agenda", icon: <Calendar size={18} /> },
  { name: "Serviços Realizados", href: "/servicos", icon: <Wrench size={18} /> },
  { name: "Minhas Promoções", href: "/promocoes", icon: <Tag size={18} /> },
  { name: "Equipe & Mecânicos", href: "/equipe", icon: <Users size={18} /> },
  { name: "Assinatura e pagamentos", href: "/mensalidade", icon: <Receipt size={18} /> },
  { name: "Relatórios", href: "/relatorios", icon: <FileText size={18} /> },
  { name: "Configurações", href: "/configuracoes", icon: <Settings size={18} /> },
  { name: "Suporte Grupo J", href: "/suporte", icon: <HelpCircle size={18} /> }
];

export const WorkshopSidebar: React.FC<{
  workshopName?: string;
}> = ({
  workshopName = "Oficina Parceira"
}) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#00091D] text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-[#13254A] select-none z-30">
      {/* Header com Logo Oficial Escura */}
      <div className="h-18 px-5 py-4 border-b border-[#13254A] flex items-center justify-between">
        <GrupoJLogo variant="dark" subtitle="OFICINA PARCEIRA" size="md" />
      </div>

      {/* Badge de Credenciamento Ativo */}
      <div className="px-4 py-2 bg-[#041129] border-b border-[#13254A] flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Shield size={12} className="text-emerald-400" />
          Portal de Oficinas
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {workshopNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/painel" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                isActive
                  ? "bg-[#034EFE] text-white shadow-md shadow-blue-900/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-800 text-blue-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil da Oficina no Rodapé */}
      <div className="p-3 border-t border-[#13254A] bg-[#020713]">
        <div className="flex items-center gap-3 p-1.5 rounded-xl">
          <Avatar name={workshopName} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white truncate">{workshopName}</p>
            <p className="text-[11px] text-emerald-400 truncate">● Credenciada Ativa</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
