/**
 * @grupo-j/workshop-web — Utilitários de Formatação
 */

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

export function formatDate(isoString: string): string {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function statusLabel(status: string): { label: string; variant: "success" | "warning" | "danger" | "info" | "default" } {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "paid":
    case "approved":
      return { label: "Ativo", variant: "success" };
    case "pending":
    case "pending_review":
    case "requested":
    case "trialing":
      return { label: "Pendente", variant: "warning" };
    case "canceled":
    case "rejected":
    case "suspended":
    case "failed":
      return { label: "Cancelado", variant: "danger" };
    default:
      return { label: status ?? "—", variant: "default" };
  }
}
