/** Formata centavos para moeda BRL: 5000 → "R$ 50,00" */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

/** Formata número com separador de milhar: 1428 → "1.428" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/** Formata data ISO para pt-BR: "2026-09-12T..." → "12/09/2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Formata data e hora para pt-BR: "2026-09-12T19:30:00Z" → "12/09/2026 às 16:30" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadge {
  label: string;
  variant: BadgeVariant;
}

/** Mapeia status do banco para label e variant do Badge */
export const STATUS_MAP: Record<string, StatusBadge> = {
  none: { label: "Sem assinatura", variant: "neutral" },
  expired: { label: "Período encerrado", variant: "warning" },
  trial:            { label: "Teste sem cobrança",       variant: "info" },
  authorized:       { label: "Autorizado, não recebido", variant: "warning" },
  refunded:         { label: "Estornado",                variant: "neutral" },
  charged_back:     { label: "Contestado",               variant: "danger" },
  failed:           { label: "Falhou",                   variant: "danger" },
  active:           { label: "Ativo",                    variant: "success" },
  inactive:         { label: "Inativo",                  variant: "neutral" },
  suspended:        { label: "Suspenso",                 variant: "warning" },
  pending_approval: { label: "Em Análise",               variant: "warning" },
  pending_review:   { label: "Aguardando Moderação",     variant: "warning" },
  approved:         { label: "Aprovada",                 variant: "success" },
  rejected:         { label: "Recusada",                 variant: "danger"  },
  completed:        { label: "Concluído",                variant: "success" },
  canceled:         { label: "Cancelado",                variant: "neutral" },
  past_due:         { label: "Inadimplente",             variant: "danger"  },
  trialing:         { label: "Período de Teste",         variant: "info"    },
  open:             { label: "Em Aberto",                variant: "info"    },
  pending:          { label: "Pendente",                 variant: "warning" },
  paid:             { label: "Pago",                     variant: "success" },
};

/** Retorna { label, variant } para uso direto no componente Badge */
export function statusLabel(status: string): StatusBadge {
  return STATUS_MAP[status] ?? { label: status, variant: "neutral" };
}

/** Compatibilidade retroativa: retorna só o texto do label */
export function statusText(status: string): string {
  return STATUS_MAP[status]?.label ?? status;
}
