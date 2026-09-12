import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel Administrativo — Grupo J",
  description: "Gestão operacional e financeira do ecossistema Grupo J"
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
