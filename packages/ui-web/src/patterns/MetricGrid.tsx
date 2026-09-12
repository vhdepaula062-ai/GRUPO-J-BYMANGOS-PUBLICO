import React from "react";
import { cn } from "../utils";

export interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  children,
  columns = 4,
  className = ""
}) => {
  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  return <div className={cn("grid gap-4 sm:gap-5", colStyles[columns], className)}>{children}</div>;
};
