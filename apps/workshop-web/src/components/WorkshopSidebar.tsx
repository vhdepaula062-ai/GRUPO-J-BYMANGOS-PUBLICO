"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const workshopNav = [
  { name: "Painel da Oficina", href: "/painel", icon: "📊" },
  { name: "Check-in Rápido", href: "/check-in", icon: "⚡" },
  { name: "Clientes Vinculados", href: "/clientes", icon: "🚗" },
  { name: "Agenda de Serviços", href: "/agenda", icon: "📅" },
  { name: "Serviços Realizados", href: "/servicos", icon: "🔧" },
  { name: "Minhas Promoções", href: "/promocoes", icon: "🏷️" },
  { name: "Equipe & Mecânicos", href: "/equipe", icon: "👥" },
  { name: "Mensalidade (R$ 500)", href: "/mensalidade", icon: "💳" },
  { name: "Relatórios", href: "/relatorios", icon: "📈" },
  { name: "Configurações", href: "/configuracoes", icon: "⚙️" },
  { name: "Suporte Grupo J", href: "/suporte", icon: "💬" }
];

export const WorkshopSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#00091D] text-white flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#034EFE] flex items-center justify-center font-bold text-white tracking-wider">
          J
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white">AUTO CENTER</span>
          <span className="block text-[10px] text-blue-400 font-medium uppercase tracking-widest">
            Portal da Oficina
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {workshopNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#034EFE] text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Auto Center Barra</p>
            <p className="text-[10px] text-emerald-400 truncate">● Credenciada Ativa</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
