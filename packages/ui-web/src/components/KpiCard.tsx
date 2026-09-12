import React from "react";
import { Card, CardContent } from "./Card";
import { Badge, BadgeProps } from "./Badge";
import { cn } from "../utils";

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: BadgeProps["variant"];
  };
  tooltip?: string;
  className?: string;
}

/**
 * Card de métrica/KPI executivo:
 * Fundo branco, ícone azul sobre contêiner azul-claro, valor destacado e comparativo secundário.
 * Traduz fielmente a linguagem das referências do Grupo J.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  tooltip,
  className
}) => {
  return (
    <Card variant="elevated" className={cn("relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#034EFE] shrink-0">
                {icon}
              </div>
            )}
            <span
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
              title={tooltip}
            >
              {title}
            </span>
          </div>
          {badge && (
            <Badge variant={badge.variant || "neutral"} size="sm">
              {badge.text}
            </Badge>
          )}
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-[#00091D] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
