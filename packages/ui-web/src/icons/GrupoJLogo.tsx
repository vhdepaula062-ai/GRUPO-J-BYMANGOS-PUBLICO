import React from "react";
export interface GrupoJLogoProps {
  variant?: "light" | "dark";
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
/** Official supplied artwork: preserve lettering, colors and proportions. */
export const GrupoJLogo: React.FC<GrupoJLogoProps> = ({variant="light",subtitle,size="md",className=""}) => (
  <div className={`flex min-w-0 flex-col items-start gap-2 select-none ${className}`} style={{maxWidth:"100%"}}>
    <div style={{width:{sm:180,md:208,lg:300}[size],maxWidth:"100%",padding:12,borderRadius:10,backgroundColor:"#00091D",boxSizing:"border-box"}}>
      <img src="/brand/grupo-j-horizontal.png" alt="Grupo J — Auto App" width={3409} height={568}
        style={{display:"block",width:"100%",height:"auto",objectFit:"contain"}} />
    </div>
    {subtitle && subtitle !== "AUTO CENTER" && <span className={`text-[9px] font-bold uppercase tracking-widest ${variant==="dark"?"text-blue-200":"text-slate-600"}`}>{subtitle}</span>}
  </div>
);
