"use client";

import React, { useState } from "react";
import { SaaSSidebar, NavItem } from "./SaaSSidebar";
import { SaaSTopbar } from "./SaaSTopbar";
import { BreakGlassBanner, BreakGlassBannerProps } from "./BreakGlassBanner";
import { X } from "../icons";

export interface SaaSAppShellProps {
  navItems: NavItem[];
  productTitle?: string;
  user?: {
    name: string;
    role: string;
    email?: string;
  };
  onLogout?: () => void;
  breakGlass?: BreakGlassBannerProps | null;
  children: React.ReactNode;
  topbarActions?: React.ReactNode;
}

export const SaaSAppShell: React.FC<SaaSAppShellProps> = ({
  navItems,
  productTitle,
  user,
  onLogout,
  breakGlass,
  children,
  topbarActions
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      {/* Banner Break-Glass de Emergência (quando ativo) */}
      {breakGlass && <BreakGlassBanner {...breakGlass} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex shrink-0">
          <SaaSSidebar
            items={navItems}
            productTitle={productTitle}
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#00091D]/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-xs bg-[#00091D] z-50">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>
              <SaaSSidebar
                items={navItems}
                productTitle={productTitle}
                user={user}
                onLogout={onLogout}
              />
            </div>
          </div>
        )}

        {/* Área Central de Conteúdo */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <SaaSTopbar
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
            user={user}
            actions={topbarActions}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
