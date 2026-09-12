import React from "react";
import { cn } from "../utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, prefixIcon, suffixIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 focus:border-[#034EFE]",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
              prefixIcon ? "pl-10" : "",
              suffixIcon ? "pr-10" : "",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "hover:border-slate-300",
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
