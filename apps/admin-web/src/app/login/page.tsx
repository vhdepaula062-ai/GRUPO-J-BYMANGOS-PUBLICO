"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button } from "@grupo-j/ui-web";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simula validação inicial e direciona para etapa obrigatória de MFA
    setTimeout(() => {
      setIsLoading(false);
      router.push("/mfa");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#00091D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#034EFE] items-center justify-center font-bold text-white text-xl mb-3 shadow-lg shadow-blue-500/20">
            J
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">GRUPO J</h2>
          <p className="text-sm text-slate-400 mt-1">Painel Administrativo do Proprietário</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-white">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Insira suas credenciais corporativas. O segundo fator (MFA) será exigido no próximo passo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Input
                label="E-mail Corporativo"
                type="email"
                required
                placeholder="seu.nome@grupoj.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Senha"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Continuar para Verificação MFA
              </Button>
              <div className="text-center">
                <Link href="#" className="text-xs text-slate-500 hover:text-slate-800">
                  Problemas no acesso ou redefinição de chave?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
