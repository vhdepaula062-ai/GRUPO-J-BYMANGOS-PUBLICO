/**
 * Tokens centrais do Sistema de Motion Design — Grupo J
 * Baseados em física natural, desaceleração elegante e acabamento premium.
 */

export const motionDurations = {
  instant: 0.12, // 120ms - microinterações imediatas, cliques
  fast: 0.18, // 180ms - hover, setas, badges
  normal: 0.28, // 280ms - cartões, menus, abas
  elegant: 0.42, // 420ms - modais, drawers, blocos de conteúdo
  sectionEnter: 0.6 // 600ms - hero sections, transições de página
} as const;

export const motionDurationsMs = {
  instant: 120,
  fast: 180,
  normal: 280,
  elegant: 420,
  sectionEnter: 600
} as const;

export const motionEasings = {
  // Curva de desaceleração suave (inspirada no acabamento Apple)
  standard: [0.22, 1, 0.36, 1] as const,
  // Curva suave para opacidade e fundos
  gentle: [0.25, 0.1, 0.25, 1] as const,
  // CSS cubic-bezier strings
  cssStandard: "cubic-bezier(0.22, 1, 0.36, 1)",
  cssGentle: "cubic-bezier(0.25, 0.1, 0.25, 1)"
} as const;

export const motionSprings = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  snappy: { stiffness: 300, damping: 24, mass: 0.8 },
  subtle: { stiffness: 180, damping: 20, mass: 1 },
  tiltReturn: { stiffness: 220, damping: 22 }
} as const;

export const motionDistances = {
  small: 8,
  medium: 16,
  large: 24
} as const;

export const motionBlur = {
  subtle: "4px",
  standard: "8px",
  hero: "10px"
} as const;

export const motionTilt = {
  maxDeg: 2.5,
  perspective: 1000,
  elevationPx: 4,
  scale: 1.015
} as const;

export const motionStagger = {
  fast: 0.05,
  standard: 0.07,
  relaxed: 0.1
} as const;
