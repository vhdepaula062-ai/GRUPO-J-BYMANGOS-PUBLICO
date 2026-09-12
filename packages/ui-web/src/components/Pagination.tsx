import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "../icons";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ""
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 text-xs text-slate-500 ${className}`}
    >
      <div>
        {totalItems && startItem && endItem ? (
          <span>
            Mostrando <strong className="text-slate-800">{startItem}</strong> a{" "}
            <strong className="text-slate-800">{endItem}</strong> de{" "}
            <strong className="text-slate-800">{totalItems}</strong> registros
          </span>
        ) : (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{" "}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft size={14} />}
        >
          Anterior
        </Button>
        <span className="px-3 py-1 font-semibold text-slate-700 bg-slate-100 rounded-lg">
          {currentPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight size={14} />}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};
