import React from "react";
import { cn } from "./utils";

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 text-slate-400">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

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
      <div className="flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <span className="font-bold uppercase tracking-wider">Acesso Técnico Emergencial Ativo (Break-Glass):</span>
        <span>{engineerName} — {reason}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-red-700/80 px-2 py-0.5 rounded text-red-100 font-mono">
          Expira em {expiresInMinutes}m
        </span>
        <span className="text-red-200 underline text-xs">Sessão Auditada</span>
      </div>
    </div>
  );
};
