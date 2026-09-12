import React from "react";
import { SearchInput } from "../components/SearchInput";
import { Button } from "../components/Button";
import { X } from "../icons";

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClearSearch?: () => void;
  filterControls?: React.ReactNode;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = "Filtrar por nome, documento ou placa...",
  searchValue = "",
  onSearchChange,
  onClearSearch,
  filterControls,
  onResetFilters,
  hasActiveFilters = false,
  className = ""
}) => {
  return (
    <div
      className={`bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex-1 max-w-md">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onClear={onClearSearch}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {filterControls}

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<X size={14} />}
            className="text-slate-500 hover:text-red-600"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};
