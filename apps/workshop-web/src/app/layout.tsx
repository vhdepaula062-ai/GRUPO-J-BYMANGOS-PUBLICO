import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Oficinas Parceiras — Grupo J",
  description: "SaaS exclusivo e credenciamento de centros automotivos Grupo J"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}
