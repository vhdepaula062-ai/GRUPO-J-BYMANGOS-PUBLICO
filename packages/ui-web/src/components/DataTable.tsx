import React from "react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { cn } from "../utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não há dados cadastrados para exibição neste momento.",
  emptyAction,
  onRowClick,
  className = ""
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`w-full space-y-3 p-6 ${className}`}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`p-8 ${className}`}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left text-sm text-slate-600 border-collapse">
        <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80 select-none">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width }}
                className={cn(
                  "px-6 py-3.5",
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                "transition-colors duration-150",
                onRowClick ? "cursor-pointer hover:bg-blue-50/30" : "hover:bg-slate-50/60"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-6 py-4 text-slate-700",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(item, index)
                    : (item as Record<string, unknown>)[col.key] !== undefined
                    ? String((item as Record<string, unknown>)[col.key])
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
