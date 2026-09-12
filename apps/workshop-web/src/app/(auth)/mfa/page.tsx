"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GrupoJLogo,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Button,
  ShieldCheck,
  ArrowLeft
} from "@grupo-j/ui-web";

export default function WorkshopMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/painel");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <GrupoJLogo variant="light" subtitle="VERIFICAÇÃO DE SEGURANÇA" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#034EFE] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>MFA Compulsório</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Autenticação de dois fatores para proteger a movimentação de vouchers e clientes da sua oficina.
          </p>
        </div>

        <Card variant="elevated" className="border border-slate-200/80 shadow-xl">
          <CardHeader className="p-6 pb-2 border-b-0">
            <CardTitle className="text-xl font-bold text-[#00091D]">
              Código de Confirmação
            </CardTitle>
            <CardDescription>
              Digite o código de 6 dígitos gerado no seu aplicativo autenticador (Google Authenticator ou similar).
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Código TOTP (6 dígitos)"
                type="text"
                required
                maxLength={6}
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-[0.5em] text-2xl font-mono font-bold h-14"
                autoFocus
              />
            </CardContent>

            <CardFooter className="p-6 pt-0 flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
                isLoading={isLoading}
                disabled={code.length < 6}
              >
                Confirmar e Acessar Painel
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#034EFE] transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Voltar para tela de login</span>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
