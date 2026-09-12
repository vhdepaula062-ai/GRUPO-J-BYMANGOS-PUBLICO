import React from "react";
import { cn } from "../utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "md", dot = false, children, ...props }, ref) => {
    const variantStyles = {
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-[#034EFE] border-blue-200",
      brand: "bg-[#034EFE] text-white border-[#034EFE]",
      neutral: "bg-slate-100 text-slate-700 border-slate-200"
    };

    const dotColors = {
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
      info: "bg-[#034EFE]",
      brand: "bg-white",
      neutral: "bg-slate-400"
    };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-[11px]",
      md: "px-2.5 py-1 text-xs"
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
