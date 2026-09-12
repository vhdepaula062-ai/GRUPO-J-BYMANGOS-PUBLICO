import React from "react";
import { ShieldAlert } from "../icons";

export interface BreakGlassBannerProps {
  engineerName?: string;
  reason: string;
  expiresInMinutes: number;
}

export const BreakGlassBanner: React.FC<BreakGlassBannerProps> = ({
  engineerName = "Engenheiro Mangos",
  reason,
  expiresInMinutes
}) => {
  return (
    <div className="bg-red-600 text-white px-4 py-2.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-medium z-50">
      <div className="flex items-center gap-2.5">
        <ShieldAlert size={18} className="animate-pulse text-white" />
        <span className="font-bold uppercase tracking-wider text-xs bg-red-800 px-2 py-0.5 rounded">
          Break-Glass Ativo
        </span>
        <span>
          {engineerName} — {reason}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-red-700/80 px-2.5 py-0.5 rounded text-red-100 font-mono text-xs">
          Expira em {expiresInMinutes}m
        </span>
        <span className="text-red-200 underline text-xs">Sessão Auditada e Gravada</span>
      </div>
    </div>
  );
};
