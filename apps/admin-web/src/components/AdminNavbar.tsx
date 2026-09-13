"use client";

import React from "react";
import Link from "next/link";
import { BreakGlassBanner, Button, LogOut, Bell, Menu, GrupoJLogo } from "@grupo-j/ui-web";

export const AdminNavbar: React.FC<{
  activeBreakGlass?: boolean;
  onOpenMobileMenu?: () => void;
}> = ({
  activeBreakGlass = false,
  onOpenMobileMenu
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80">
      {activeBreakGlass && (
        <BreakGlassBanner
          engineerName="Engenheiro Mangos (Suporte N3)"
          reason="Manutenção programada e monitoramento de conciliação de faturas"
          expiresInMinutes={45}
        />
      )}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Esquerda: Botão Hamburguer no Mobile e Status no Desktop */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Abrir Menu de Navegação"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden flex items-center">
            <GrupoJLogo variant="light" size="sm" />
          </div>
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Status da Rede:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Produção Homologada & Auditada
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://grupo-j-oficinas.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar Landing Page e Portal das Oficinas"
            className="hidden sm:inline-flex"
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-blue-200 text-[#034EFE] bg-blue-50/60 hover:bg-blue-100/60 font-semibold text-xs"
            >
              🚗 Ver Portal de Oficinas ↗
            </Button>
          </a>

          <button
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
            aria-label="Notificações operacionais"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#034EFE]" />
          </button>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-slate-600 font-medium"
              leftIcon={<LogOut size={14} />}
            >
              Sair
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
