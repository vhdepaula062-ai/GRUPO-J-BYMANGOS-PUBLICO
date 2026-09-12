"use client";

import React, { useState } from "react";
import { GrupoJLogo, GrupoJSymbol } from "../icons";
import { ChevronLeft, ChevronRight, LogOut, Shield } from "../icons";
import { cn } from "../utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SaaSSidebarProps {
  items: NavItem[];
  productTitle?: string;
  currentPath?: string;
  user?: {
    name: string;
    role: string;
    email?: string;
  };
  onLogout?: () => void;
  environmentBadge?: string;
}

export const SaaSSidebar: React.FC<SaaSSidebarProps> = ({
  items,
  productTitle = "AUTO CENTER",
  currentPath,
  user,
  onLogout,
  environmentBadge = "Ambiente Seguro"
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activePath =
    currentPath || (typeof window !== "undefined" ? window.location.pathname : "");

  return (
    <aside
      className={cn(
        "bg-[#00091D] text-slate-300 flex flex-col justify-between border-r border-[#13254A] transition-all duration-200 select-none shrink-0 z-30",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Topo / Header da Sidebar */}
      <div>
        <div className="h-18 px-4 py-5 flex items-center justify-between border-b border-[#13254A]">
          {isCollapsed ? (
            <div className="mx-auto" title="Grupo J">
              <GrupoJSymbol size={36} variant="primary" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GrupoJLogo variant="dark" subtitle={productTitle} size="md" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Badge de Ambiente */}
        {!isCollapsed && environmentBadge && (
          <div className="px-4 py-2 bg-[#041129] border-b border-[#13254A] flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Shield size={12} className="text-emerald-400" />
              {environmentBadge}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Itens de Navegação */}
        <nav className="p-3 space-y-1 mt-2">
          {items.map((item) => {
            const isActive =
              activePath === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/painel" &&
                activePath.startsWith(item.href));

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#034EFE] text-white shadow-md shadow-blue-900/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    "shrink-0 transition-transform duration-150 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  )}
                >
                  {item.icon}
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Usuário & Logout */}
      <div className="p-3 border-t border-[#13254A] bg-[#020713]">
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl mb-1",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#034EFE] text-white font-bold flex items-center justify-center shrink-0 border border-blue-400/40 text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-blue-400 truncate">{user.role}</p>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Sair do sistema"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
