import React from "react";
import { cn } from "../utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034EFE] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-95";

    const variantStyles = {
      primary: "bg-[#034EFE] text-white hover:bg-[#023ECC] shadow-sm",
      secondary: "bg-[#00091D] text-white hover:bg-[#0A1733] shadow-sm",
      outline: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      danger: "text-red-600 hover:bg-red-50"
    };

    const sizeStyles = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
