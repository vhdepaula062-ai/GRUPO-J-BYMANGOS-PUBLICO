"use client";

import React from "react";
import Link from "next/link";

export const WorkshopNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-slate-800">Unidade:</span>
          <span className="text-slate-600">Barra da Tijuca — Rio de Janeiro/RJ</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/check-in"
            className="text-xs font-semibold bg-[#034EFE] text-white px-3 py-1.5 rounded-lg hover:bg-[#023ECC] transition-colors"
          >
            ⚡ Validar Voucher
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Sair
          </Link>
        </div>
      </div>
    </header>
  );
};
