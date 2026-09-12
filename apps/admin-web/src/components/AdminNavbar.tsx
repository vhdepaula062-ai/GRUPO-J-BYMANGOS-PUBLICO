"use client";

import React from "react";
import Link from "next/link";
import { BreakGlassBanner } from "@grupo-j/ui-web";

export const AdminNavbar: React.FC<{ activeBreakGlass?: boolean }> = ({
  activeBreakGlass = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {activeBreakGlass && (
        <BreakGlassBanner
          engineerName="Engenheiro Mangos (Suporte N3)"
          reason="Manutenção programada e monitoramento de conciliação de faturas"
          expiresInMinutes={45}
        />
      )}
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Ambiente:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            Produção Homologada
          </span>
        </div>

        <div className="flex items-center gap-4">
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
