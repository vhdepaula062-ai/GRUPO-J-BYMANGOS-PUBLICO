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
  Lock,
  AlertCircle
} from "@grupo-j/ui-web";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let authError;
    try {
      const supabase = createClient();
      ({ error: authError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }));
    } catch {
      setIsLoading(false);
      setError("Serviço de autenticação não configurado ou indisponível.");
      return;
    }

    if (authError) {
      setIsLoading(false);
      // Traduzir erros do Supabase para português
      if (authError.message.includes("Invalid login credentials")) {
        setError("E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.");
      } else if (authError.message.includes("Too many requests")) {
        setError("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
      } else {
        setError("Erro ao autenticar. Tente novamente ou entre em contato com o suporte.");
      }
      return;
    }

    // Login bem-sucedido → redirecionar para o dashboard
    router.push("/dashboard");
    router.refresh();
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
            <span>Acesso Restrito à Diretoria &amp; Operação</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Gestão estratégica, auditoria financeira e monitoramento em tempo real do ecossistema.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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
                label="E-mail Corporativo"
                type="email"
                required
                placeholder="nome@grupoj.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<Mail size={16} />}
                disabled={isLoading}
              />

              <PasswordInput
                label="Senha de Acesso"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
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
                {isLoading ? "Autenticando..." : "Entrar no Painel"}
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
