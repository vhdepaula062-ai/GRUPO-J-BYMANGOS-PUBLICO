"use client";

import React from "react";
import { Input, InputProps } from "./Input";
import { Search, X } from "../icons";

export interface SearchInputProps extends Omit<InputProps, "prefixIcon" | "suffixIcon"> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, onChange, placeholder = "Buscar...", ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        prefixIcon={<Search size={18} />}
        suffixIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          ) : undefined
        }
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
