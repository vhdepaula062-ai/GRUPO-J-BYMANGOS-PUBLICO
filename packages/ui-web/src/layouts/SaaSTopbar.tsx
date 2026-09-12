"use client";

import React from "react";
import { SearchInput } from "../components/SearchInput";
import { Avatar } from "../components/Avatar";
import { Bell, Menu } from "../icons";

export interface SaaSTopbarProps {
  onMobileMenuToggle?: () => void;
  title?: string;
  user?: {
    name: string;
    role: string;
  };
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

export const SaaSTopbar: React.FC<SaaSTopbarProps> = ({
  onMobileMenuToggle,
  title,
  user,
  actions,
  searchPlaceholder = "Buscar no sistema...",
  onSearch
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Esquerda: Botão mobile e Título */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        )}
        {title && (
          <h2 className="hidden sm:block text-base font-bold text-[#00091D] tracking-tight">
            {title}
          </h2>
        )}
      </div>

      {/* Centro: Barra de Busca Rápida (Opcional) */}
      {onSearch && (
        <div className="hidden md:block max-w-xs w-full">
          <SearchInput
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* Direita: Ações, Notificações e Perfil */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Notificações */}
        <button
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#034EFE]" />
        </button>

        {/* Perfil do Usuário */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
            <Avatar name={user.name} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
