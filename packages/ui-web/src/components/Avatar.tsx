import React from "react";
import { cn } from "../utils";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md", className }) => {
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
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || "GJ"}</span>
      )}
    </div>
  );
};
