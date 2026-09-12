"use client";

import React from "react";
import Link from "next/link";
import { Button, MapPin, Zap, LogOut } from "@grupo-j/ui-web";

export const WorkshopNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Localização / Unidade */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
        <MapPin size={16} className="text-[#034EFE] shrink-0" />
        <span className="font-semibold text-slate-900 hidden sm:inline">Unidade:</span>
        <span className="text-slate-600 truncate font-medium">Barra da Tijuca — Rio de Janeiro/RJ</span>
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
