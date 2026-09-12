"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GrupoJLogo,
  TrendingUp,
  Users,
  Wrench,
  Receipt,
  DollarSign,
  ShieldCheck,
  MapPin,
  Tag,
  Settings,
  FileText,
  Lock,
  Shield,
  Avatar
} from "@grupo-j/ui-web";

const navigation = [
  { name: "Visão Geral", href: "/dashboard", icon: <TrendingUp size={18} /> },
  { name: "Motoristas", href: "/clientes", icon: <Users size={18} /> },
  { name: "Oficinas Parceiras", href: "/oficinas", icon: <Wrench size={18} />, badge: "36" },
  { name: "Assinaturas", href: "/assinaturas", icon: <Receipt size={18} /> },
  { name: "Financeiro & MRR", href: "/financeiro", icon: <DollarSign size={18} /> },
  { name: "Benefícios & Regras", href: "/beneficios", icon: <ShieldCheck size={18} /> },
  { name: "Check-ins & Visitas", href: "/visitas", icon: <MapPin size={18} /> },
  { name: "Promoções", href: "/promocoes", icon: <Tag size={18} /> },
  { name: "Configurações Remotas", href: "/configuracoes", icon: <Settings size={18} /> },
  { name: "Usuários & Acessos", href: "/usuarios", icon: <Users size={18} /> },
  { name: "Trilha de Auditoria", href: "/auditoria", icon: <FileText size={18} /> },
  { name: "Privacidade (LGPD)", href: "/privacidade", icon: <Lock size={18} /> }
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#00091D] text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-[#13254A] select-none z-30">
      {/* Header com Logo Oficial Escura */}
      <div className="h-18 px-5 py-4 border-b border-[#13254A] flex items-center justify-between">
        <GrupoJLogo variant="dark" subtitle="GESTÃO & GOVERNANÇA" size="md" />
      </div>

      {/* Badge de Ambiente Corporativo */}
      <div className="px-4 py-2 bg-[#041129] border-b border-[#13254A] flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Shield size={12} className="text-emerald-400" />
          Acesso Proprietário
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Navegação Executiva */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

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

      {/* Rodapé: Usuário Joaquim */}
      <div className="p-3 border-t border-[#13254A] bg-[#020713]">
        <div className="flex items-center gap-3 p-1.5 rounded-xl">
          <Avatar name="Joaquim" size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white truncate">Joaquim</p>
            <p className="text-[11px] text-blue-400 truncate">Proprietário / Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
