/**
 * Escala tipográfica do SaaS Grupo J.
 * Garante hierarquia uniforme, legibilidade e alinhamento com a marca.
 */
export const saasTypography = {
  display: "text-3xl sm:text-4xl font-extrabold text-[#00091D] tracking-tight leading-tight",
  pageTitle: "text-2xl font-bold text-[#00091D] tracking-tight",
  sectionTitle: "text-lg font-bold text-[#00091D] tracking-tight",
  cardTitle: "text-base font-semibold text-[#00091D]",
  metricValue: "text-2xl sm:text-3xl font-extrabold text-[#00091D] tracking-tight",
  body: "text-sm text-slate-600 leading-relaxed",
  bodySmall: "text-xs text-slate-500 leading-normal",
  label: "text-xs font-semibold uppercase tracking-wider text-slate-500",
  caption: "text-[11px] text-slate-400 font-medium",
  tableHeader: "text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80",
  tableCell: "text-sm text-slate-700",
  tableCellMuted: "text-xs text-slate-400"
} as const;

export type SaasTypography = typeof saasTypography;
