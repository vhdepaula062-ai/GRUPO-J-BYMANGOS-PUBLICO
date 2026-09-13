import React from "react";
import { Badge, BadgeProps } from "./Badge";

export interface StatusBadgeProps {
  status: string;
  size?: BadgeProps["size"];
  className?: string;
}

/**
 * Mapeamento canônico de status do ecossistema Grupo J para badges acessíveis com dot indicador.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md", className }) => {
  const normalized = status.toLowerCase();

  let variant: BadgeProps["variant"] = "neutral";
  let label = status;

  switch (normalized) {
    case "active":
    case "ativa":
    case "ativo":
    case "paid":
    case "pago":
    case "em dia":
    case "approved":
    case "aprovado":
    case "concluido":
    case "concluído":
      variant = "success";
      label = status === "active" ? "Ativa" : status === "paid" ? "Pago" : status;
      break;

    case "pending":
    case "pending_approval":
    case "pending_review":
    case "pendente":
    case "trial":
    case "in_review":
    case "em analise":
    case "em análise":
    case "aguardando":
      variant = "warning";
      label = status === "pending_approval" ? "Aguardando Aprovação" : status === "pending" ? "Pendente" : status === "trial" ? "Período de Testes" : status;
      break;

    case "overdue":
    case "atrasada":
    case "inadimplente":
    case "rejected":
    case "recusado":
    case "canceled":
    case "cancelado":
    case "cancelada":
    case "suspended":
    case "suspensa":
      variant = "danger";
      label = status === "overdue" ? "Inadimplente" : status === "canceled" ? "Cancelada" : status;
      break;

    case "info":
    case "rede ativa":
    case "parceiro":
      variant = "info";
      break;

    default:
      variant = "neutral";
      break;
  }

  return (
    <Badge variant={variant} size={size} dot className={className}>
      {label}
    </Badge>
  );
};
