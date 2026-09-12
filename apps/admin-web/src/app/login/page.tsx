"use client";

import React, { useState } from "react";
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
  ArrowRight,
  Lock
} from "@grupo-j/ui-web";

export default function AdminLoginPage() {
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
        {/* Identificação Oficial do Backoffice */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <GrupoJLogo variant="light" subtitle="PAINEL ADMINISTRATIVO" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
            <Lock size={12} className="text-blue-400" />
            <span>Acesso Restrito à Diretoria & Operação</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Gestão estratégica, auditoria financeira e monitoramento em tempo real do ecossistema.
          </p>
        </div>

        {/* Card de Autenticação */}
        <Card variant="elevated" className="border border-slate-200/80 shadow-xl">
          <CardHeader className="p-6 pb-2 border-b-0">
            <CardTitle className="text-xl font-bold text-[#00091D]">
              Entrar no Backoffice
            </CardTitle>
            <CardDescription>
              Insira suas credenciais corporativas. O segundo fator (MFA) é obrigatório por política de segurança.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4">
              <Input
                label="E-mail Corporativo (@grupoj.com.br)"
                type="email"
                required
                placeholder="nome@grupoj.com.br"
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
                  <span>Dispositivo confiável</span>
                </label>
                <a href="#ajuda" className="font-semibold text-[#034EFE] hover:underline">
                  Esqueceu a chave?
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
                Continuar para Etapa 2 (MFA)
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Rodapé de Segurança */}
        <div className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Sessão protegida por trilha imutável e HMAC Blind Index</span>
        </div>
      </div>
    </div>
  );
}
