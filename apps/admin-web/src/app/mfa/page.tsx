"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button } from "@grupo-j/ui-web";

export default function MfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#00091D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#034EFE] items-center justify-center font-bold text-white text-xl mb-3">
            J
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verificação em Duas Etapas</h2>
          <p className="text-sm text-slate-400 mt-1">Autenticação obrigatória para administradores</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <CardTitle>Código TOTP</CardTitle>
            <CardDescription>
              Abra seu aplicativo autenticador (Google Authenticator, 1Password ou Authy) e digite o código de 6 dígitos.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                label="Código de Autenticação"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-widest text-lg font-mono"
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Confirmar e Acessar Painel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
