import React from "react";
import { cn } from "../utils";

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
