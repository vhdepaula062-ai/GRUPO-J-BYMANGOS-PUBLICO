"use client";

import React, { useEffect } from "react";
import { Button, AlertCircle, RefreshCw } from "@grupo-j/ui-web";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#00091D]">
            Sincronização Temporariamente Indisponível
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Não foi possível completar a consulta com o servidor de dados. Suas permissões e credenciais continuam ativas.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RefreshCw size={15} />}
            className="bg-[#034EFE] font-bold shadow-md shadow-blue-600/20"
          >
            Tentar Novamente
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.location.href = "/dashboard"}
            className="font-medium text-slate-700"
          >
            Ir para Visão Geral
          </Button>
        </div>
      </div>
    </div>
  );
}
