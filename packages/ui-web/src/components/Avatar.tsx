import React from "react";
import { cn } from "../utils";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function isSafeImageSrc(url?: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:text/html") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:image/svg+xml")
  ) {
    return false;
  }
  return (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("/") ||
    lower.startsWith("data:image/")
  );
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md", className }) => {
  const safeSrc = isSafeImageSrc(src) ? src : undefined;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base font-bold"
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-[#034EFE] border-2 border-white shadow-sm overflow-hidden select-none",
        sizeStyles[size],
        className
      )}
      title={name}
      aria-label={name}
    >
      {safeSrc ? (
        <img src={safeSrc} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || "GJ"}</span>
      )}
    </div>
  );
};
