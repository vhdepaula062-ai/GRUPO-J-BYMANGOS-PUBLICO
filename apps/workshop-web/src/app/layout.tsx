import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@grupo-j/ui-web";
import { PWAProvider } from "@/components/pwa-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Portal de Oficinas Parceiras — Grupo J",
  description: "SaaS exclusivo e credenciamento de centros automotivos Grupo J",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Grupo J Oficinas"
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#00091D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body data-ui-theme="grupo-j-saas" className="min-h-screen antialiased bg-[#F8FAFC] text-slate-900 font-sans">
        <MotionProvider>
          <PWAProvider>{children}</PWAProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
