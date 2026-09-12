import React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from "../icons";
import { cn } from "../utils";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  className
}) => {
  const variantStyles = {
    info: "bg-blue-50 border-blue-200 text-[#034EFE]",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800"
  };

  const icons = {
    info: <Info size={20} className="text-[#034EFE] shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />,
    danger: <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-xl border text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-bold mb-1 tracking-tight">{title}</h5>}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
};
