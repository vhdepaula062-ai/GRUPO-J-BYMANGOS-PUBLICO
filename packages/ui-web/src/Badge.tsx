import React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => {
    const variantStyles = {
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-[#034EFE] border-blue-200",
      neutral: "bg-slate-100 text-slate-700 border-slate-200"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
