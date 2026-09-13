import React from "react";

export interface CarHeroGraphicProps {
  className?: string;
  size?: number;
}

/**
 * Ilustração vetorial automotiva premium e de alta precisão do Grupo J.
 * Representa um veículo contemporâneo com aerodinâmica fluida, faróis tecnológicos,
 * rodas usinadas e gradientes institucionais em Azul Elétrico (#034EFE).
 */
export const CarHeroGraphic: React.FC<CarHeroGraphicProps> = ({
  className = "",
  size = 220
}) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.52)}
      viewBox="0 0 360 188"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-xl ${className}`}
    >
      <defs>
        {/* Gradiente principal da lataria */}
        <linearGradient id="carBodyGrad" x1="20" y1="50" x2="340" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#023ECC" />
          <stop offset="35%" stopColor="#034EFE" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#034EFE" />
        </linearGradient>

        {/* Gradiente do vidro com reflexo glassmorphism */}
        <linearGradient id="carGlassGrad" x1="100" y1="40" x2="260" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A1E4A" />
          <stop offset="50%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
        </linearGradient>

        {/* Gradiente das rodas */}
        <radialGradient id="wheelRimGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="85%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>

        {/* Brilho do farol dianteiro */}
        <radialGradient id="headlightGlow" cx="20%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="70%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sombra de solo suave sob o carro */}
      <ellipse cx="180" cy="165" rx="145" ry="12" fill="#00091D" fillOpacity="0.18" />

      {/* Chassi inferior / saia lateral */}
      <path
        d="M50 142L72 142C75 125 90 112 108 112C126 112 141 125 144 142L228 142C231 125 246 112 264 112C282 112 297 125 300 142L320 138C328 135 334 126 332 116L324 88C320 74 308 65 294 63L245 58C228 42 205 32 180 32L125 32C102 32 82 44 72 62L42 90C34 98 30 108 32 118L36 132C38 138 43 142 50 142Z"
        fill="url(#carBodyGrad)"
      />

      {/* Área da cabine / Janelas (Glassmorphism reflexivo) */}
      <path
        d="M125 40L178 40C198 40 216 48 230 62L275 66C283 67 290 73 292 81L295 90L102 90L112 55C114 46 119 40 125 40Z"
        fill="url(#carGlassGrad)"
      />

      {/* Coluna central da janela (B-Pillar) */}
      <rect x="185" y="40" width="8" height="50" fill="#0F172A" rx="2" />

      {/* Reflexo dinâmico no para-brisa */}
      <path
        d="M132 44L170 44L150 86L118 86Z"
        fill="white"
        fillOpacity="0.16"
      />

      {/* Linha de vinco esportiva na lateral */}
      <path
        d="M48 98C110 94 210 92 312 96"
        stroke="#93C5FD"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Farol dianteiro tecnológico */}
      <path
        d="M316 92L330 94C333 97 332 103 328 106L308 108Z"
        fill="url(#headlightGlow)"
      />
      <circle cx="320" cy="98" r="3" fill="#FFFFFF" />

      {/* Lanterna traseira em LED */}
      <path
        d="M34 100L44 98L42 110L32 108C30 105 31 102 34 100Z"
        fill="#EF4444"
      />

      {/* Maçanetas das portas cromadas */}
      <rect x="150" y="98" width="16" height="4" rx="2" fill="#E2E8F0" />
      <rect x="220" y="98" width="16" height="4" rx="2" fill="#E2E8F0" />

      {/* Roda Traseira (Pneu e Roda Usinada) */}
      <g>
        <circle cx="108" cy="142" r="28" fill="#0F172A" />
        <circle cx="108" cy="142" r="21" fill="url(#wheelRimGrad)" stroke="#64748B" strokeWidth="1.5" />
        {/* Raios da roda */}
        <circle cx="108" cy="142" r="7" fill="#034EFE" />
        <line x1="108" y1="123" x2="108" y2="161" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="89" y1="142" x2="127" y2="142" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="95" y1="129" x2="121" y2="155" stroke="#94A3B8" strokeWidth="2" />
        <line x1="95" y1="155" x2="121" y2="129" stroke="#94A3B8" strokeWidth="2" />
      </g>

      {/* Roda Dianteira (Pneu e Roda Usinada) */}
      <g>
        <circle cx="264" cy="142" r="28" fill="#0F172A" />
        <circle cx="264" cy="142" r="21" fill="url(#wheelRimGrad)" stroke="#64748B" strokeWidth="1.5" />
        {/* Raios da roda */}
        <circle cx="264" cy="142" r="7" fill="#034EFE" />
        <line x1="264" y1="123" x2="264" y2="161" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="245" y1="142" x2="283" y2="142" stroke="#94A3B8" strokeWidth="2.5" />
        <line x1="251" y1="129" x2="277" y2="155" stroke="#94A3B8" strokeWidth="2" />
        <line x1="251" y1="155" x2="277" y2="129" stroke="#94A3B8" strokeWidth="2" />
      </g>
    </svg>
  );
};
