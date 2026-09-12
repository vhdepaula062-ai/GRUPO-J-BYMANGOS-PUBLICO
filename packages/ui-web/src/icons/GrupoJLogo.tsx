import React from "react";
import { GrupoJSymbol } from "./GrupoJSymbol";

export interface GrupoJLogoProps {
  variant?: "light" | "dark";
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Logotipo horizontal oficial do Grupo J:
 * Símbolo vetorial + lettering "GRUPO J" + subtítulo operacional.
 * Baseado na referência aprovada pelo cliente ("ESSE" em desgnref 7 e desgnref 2, 4).
 */
export const GrupoJLogo: React.FC<GrupoJLogoProps> = ({
  variant = "light",
  subtitle = "AUTO CENTER",
  size = "md",
  className = ""
}) => {
  const isDark = variant === "dark";

  const sizeMap = {
    sm: { symbol: 28, text: "text-base", sub: "text-[9px]" },
    md: { symbol: 36, text: "text-xl", sub: "text-[10px]" },
    lg: { symbol: 44, text: "text-2xl", sub: "text-xs" }
  };

  const { symbol, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <GrupoJSymbol
        size={symbol}
        variant={isDark ? "primary" : "primary"}
      />
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none ${text} ${
            isDark ? "text-white" : "text-[#034EFE]"
          }`}
          style={{ fontFamily: "inherit" }}
        >
          GRUPO J
        </span>
        {subtitle && (
          <span
            className={`font-bold tracking-widest uppercase mt-0.5 ${sub} ${
              isDark ? "text-blue-400" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
