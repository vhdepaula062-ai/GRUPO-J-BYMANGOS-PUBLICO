import React from "react";
export interface GrupoJSymbolProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  /** Existing callers are supported; the official artwork is never recolored. */
  variant?: "primary" | "white" | "navy" | "mono";
}
export const GrupoJSymbol: React.FC<GrupoJSymbolProps> = ({size=36,variant,className="",...props}) => (
  <svg width={size} height={size} viewBox="0 0 1952 1952" role="img" aria-label="Grupo J" className={className} {...props}>
    <image href="/brand/grupo-j-profile.png" width="1952" height="1952" preserveAspectRatio="xMidYMid meet" />
  </svg>
);
