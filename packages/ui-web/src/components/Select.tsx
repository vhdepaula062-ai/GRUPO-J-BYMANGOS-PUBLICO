import React from "react";
import { cn } from "../utils";
import { ChevronDown } from "../icons";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full h-11 px-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 transition-all duration-150 shadow-sm appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20 focus:border-[#034EFE]",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "hover:border-slate-300",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <ChevronDown size={18} />
          </div>
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

Select.displayName = "Select";
