"use client";

import React from "react";
import Link from "next/link";
import { Button, MapPin, Zap, LogOut, Menu, GrupoJLogo } from "@grupo-j/ui-web";

export const WorkshopNavbar: React.FC<{
  onOpenMobileMenu?: () => void;
}> = ({
  onOpenMobileMenu
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
      {/* Esquerda: Botão Hamburguer no Mobile e Unidade no Desktop */}
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
        <div className="hidden lg:flex items-center gap-2 text-xs sm:text-sm text-slate-700">
          <MapPin size={16} className="text-[#034EFE] shrink-0" />
          <span className="font-semibold text-slate-900">Unidade:</span>
          <span className="text-slate-600 truncate font-medium">Barra da Tijuca — Rio de Janeiro/RJ</span>
        </div>
      </div>

      {/* Ações Rápidas: Validar Voucher & Sair */}
      <div className="flex items-center gap-3">
        <Link href="/check-in">
          <Button
            variant="primary"
            size="sm"
            className="h-9 font-bold shadow-sm shadow-blue-600/20"
            leftIcon={<Zap size={15} className="text-amber-300" />}
          >
            ⚡ Validar Voucher
          </Button>
        </Link>
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-slate-600"
            leftIcon={<LogOut size={14} />}
          >
            Sair
          </Button>
        </Link>
      </div>
    </header>
  );
};
