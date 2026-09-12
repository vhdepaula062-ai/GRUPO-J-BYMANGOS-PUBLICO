import React from "react";

export interface GrupoJSymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "primary" | "white" | "navy" | "mono";
}

/**
 * Símbolo vetorial oficial do Grupo J:
 * Distintivo geométrico chanfrado com monograma estilizado "J".
 * Baseado estritamente nas referências do Manual de Marca (desgnref 2, 4, 7).
 */
export const GrupoJSymbol: React.FC<GrupoJSymbolProps> = ({
  size = 36,
  variant = "primary",
  className = "",
  ...props
}) => {
  // Cores do contêiner externo (badge)
  const bgColors = {
    primary: "#034EFE",
    white: "#FFFFFF",
    navy: "#00091D",
    mono: "currentColor"
  };

  // Cores do monograma interno "J"
  const jColors = {
    primary: "#FFFFFF",
    white: "#034EFE",
    navy: "#FFFFFF",
    mono: "#00091D"
  };

  const bgColor = bgColors[variant];
  const jColor = jColors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Grupo J Símbolo"
      {...props}
    >
      {/* Distintivo com chanfro no topo-esquerdo e cantos arredondados */}
      <path
        d="M38 6 H80 C91 6 94 9 94 20 V80 C94 91 91 94 80 94 H20 C9 94 6 91 6 80 V38 L38 6 Z"
        fill={bgColor}
      />
      {/* Monograma estilizado "J" com recortes geométricos */}
      <path
        d="M48 24 H62 V64 C62 70 58 74 50 74 H42 C34 74 30 70 30 64 V56 H42 V62 H50 V36 H48 V24 Z"
        fill={jColor}
      />
      {/* Detalhe angular do gancho do J */}
      <path
        d="M30 46 L42 36 V48 L30 58 V46 Z"
        fill={jColor}
      />
    </svg>
  );
};
