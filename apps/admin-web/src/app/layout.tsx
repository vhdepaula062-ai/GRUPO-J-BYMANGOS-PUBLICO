import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@grupo-j/ui-web";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

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
    <html lang="pt-BR" className={inter.variable}>
      <body data-ui-theme="grupo-j-saas" className="min-h-screen antialiased bg-[#F8FAFC] text-slate-900 font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
