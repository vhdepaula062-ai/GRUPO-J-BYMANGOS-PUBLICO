import React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#034EFE] focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
