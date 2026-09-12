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
  PasswordInput,
  Button,
  ShieldCheck,
  Mail,
  ArrowRight
} from "@grupo-j/ui-web";

export default function WorkshopLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/mfa");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Identificação da Marca */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <GrupoJLogo variant="light" subtitle="PORTAL DO PARCEIRO" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#034EFE] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Acesso Exclusivo das Oficinas</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Gerencie atendimentos, valide vouchers de clientes e consulte sua mensalidade parceira.
          </p>
        </div>

        {/* Card de Autenticação */}
        <Card variant="elevated" className="border border-slate-200/80 shadow-xl">
          <CardHeader className="p-6 pb-2 border-b-0">
            <CardTitle className="text-xl font-bold text-[#00091D]">
              Entrar na sua Oficina
            </CardTitle>
            <CardDescription>
              Insira as credenciais do titular, gerente ou atendente autorizado.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <Input
                label="E-mail Corporativo da Oficina"
                type="email"
                required
                placeholder="contato@autocenter.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<Mail size={16} />}
              />

              <PasswordInput
                label="Senha de Acesso"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#034EFE] focus:ring-[#034EFE]"
                  />
                  <span>Lembrar e-mail</span>
                </label>
                <a href="#recuperar" className="font-semibold text-[#034EFE] hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0 flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                Avançar para Verificação MFA
              </Button>

              <div className="pt-2 text-center border-t border-slate-100 w-full">
                <p className="text-xs text-slate-500">
                  Sua oficina ainda não é parceira credenciada?{" "}
                  <Link href="/seja-parceiro" className="font-bold text-[#034EFE] hover:underline">
                    Seja Parceiro
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Rodapé Seguro */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Sessão protegida por criptografia de ponta a ponta e autenticação em dois fatores.
        </p>
      </div>
    </div>
  );
}
