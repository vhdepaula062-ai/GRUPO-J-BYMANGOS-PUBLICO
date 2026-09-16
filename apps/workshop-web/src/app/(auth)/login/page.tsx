"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Building2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock
} from "@grupo-j/ui-web";
import { createClient } from "@/lib/supabase/client";
import { registerWorkshopPartnerAction, type RegisterWorkshopPartnerResult } from "./actions";

function WorkshopAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("modo") === "cadastro" ? "cadastro" : "login";

  const [mode, setMode] = useState<"login" | "cadastro">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmittedPending, setIsSubmittedPending] = useState(false);
  const [submittedWorkshop, setSubmittedWorkshop] = useState<RegisterWorkshopPartnerResult["workshop"] | null>(null);

  // Campos de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos de Cadastro
  const [tradeName, setTradeName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Submissão de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      if (authError) {
        setIsLoading(false);
        if (authError.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos. Caso ainda não tenha cadastro, use a aba 'Criar Cadastro'.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.");
        } else if (authError.message.includes("Too many requests")) {
          setError("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
        } else {
          // Permite que o operador acerte ou entre
          setError("Credenciais não localizadas. Caso seja uma nova oficina, clique na aba 'Criar Cadastro' acima.");
        }
        return;
      }

      router.push("/painel");
      router.refresh();
    } catch {
      setIsLoading(false);
      setError("Serviço de autenticação não configurado ou indisponível.");
    }
  };

  // Submissão de Cadastro (Enviado para Homologação do Joaquim / Admin)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (registerPassword.length < 6) {
      setIsLoading(false);
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setIsLoading(false);
      setError("As senhas não coincidem. Digite novamente.");
      return;
    }

    if (!acceptedTerms) {
      setIsLoading(false);
      setError("É necessário concordar com os Termos de Parceria e LGPD.");
      return;
    }

    try {
      const res = await registerWorkshopPartnerAction({
        tradeName: tradeName.trim(),
        cnpj: cnpj.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword
      });

      setIsLoading(false);

      if (res.success) {
        setSubmittedWorkshop(
          res.workshop || {
            id: `ws-${Date.now()}`,
            trade_name: tradeName.trim(),
            cnpj_masked: cnpj.trim(),
            status: "pending_approval",
            email: registerEmail.trim().toLowerCase(),
            phone: phone.trim(),
            responsible_name: contactName.trim()
          }
        );
        setIsSubmittedPending(true);
      } else {
        setError(res.message || "Erro ao processar proposta de credenciamento.");
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Erro de conexão ao enviar proposta. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Identificação da Marca */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center mb-4">
            <GrupoJLogo variant="light" subtitle="PORTAL DO PARCEIRO" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#034EFE] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Acesso & Credenciamento de Oficinas</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Ecossistema operacional para auto centers parceiros, validação de vouchers e agenda de boxes.
          </p>
        </div>

        {/* Abas Alternadoras: Entrar vs Cadastro */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-4 text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-[#00091D] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Entrar na sua Oficina
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("cadastro");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === "cadastro"
                ? "bg-[#034EFE] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Criar Novo Cadastro
          </button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="mb-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Card Principal */}
        <Card variant="elevated" className="border border-slate-200/80 shadow-xl">
          {mode === "login" ? (
            /* Formulário de Login */
            <form onSubmit={handleLogin}>
              <CardHeader className="p-6 pb-2 border-b-0">
                <CardTitle className="text-xl font-bold text-[#00091D]">
                  Acessar Painel da Oficina
                </CardTitle>
                <CardDescription>
                  Insira as credenciais da sua oficina credenciada.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <Input
                  label="E-mail Corporativo da Oficina"
                  type="email"
                  required
                  placeholder="contato@autocenter.com.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  prefixIcon={<Mail size={16} />}
                  disabled={isLoading}
                />

                <PasswordInput
                  label="Senha de Acesso"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      defaultChecked
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
                  className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20 bg-[#034EFE]"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {isLoading ? "Autenticando..." : "Entrar no Painel"}
                </Button>

                <div className="pt-2 text-center border-t border-slate-100 w-full">
                  <p className="text-xs text-slate-500">
                    Sua oficina ainda não tem cadastro?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("cadastro")}
                      className="font-bold text-[#034EFE] hover:underline"
                    >
                      Cadastrar Oficina Agora
                    </button>
                  </p>
                </div>
              </CardFooter>
            </form>
          ) : isSubmittedPending && submittedWorkshop ? (
            /* Tela de Confirmação: Proposta Enviada para Homologação do Administrador */
            <div className="p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                <Clock size={32} className="animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-black uppercase tracking-wider">
                  <Clock size={13} />
                  <span>Aguardando Aprovação do Administrador</span>
                </div>
                <h3 className="text-2xl font-black text-[#00091D] tracking-tight">
                  Proposta Enviada com Sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  O cadastro da sua oficina foi registrado e encaminhado para a moderação da diretoria no{" "}
                  <strong className="text-slate-900">Painel Administrativo do Grupo J</strong>.
                </p>
              </div>

              {/* Resumo da Oficina Submetida */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Nome Fantasia:</span>
                  <span className="font-bold text-slate-900">{submittedWorkshop.trade_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">CNPJ:</span>
                  <span className="font-mono font-semibold text-slate-800">{submittedWorkshop.cnpj_masked}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Responsável:</span>
                  <span className="font-medium text-slate-800">{submittedWorkshop.responsible_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">E-mail de Acesso:</span>
                  <span className="font-medium text-slate-800">{submittedWorkshop.email}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500 font-medium">Status Operacional:</span>
                  <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    Pendente de Homologação
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-left text-xs text-slate-700 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#034EFE] shrink-0 mt-0.5" />
                <span>
                  Nossa diretoria analisará seus dados cadastrais. Assim que sua oficina for homologada pelo Joaquim no Painel Central, seu acesso operacional ao validador de vouchers e agenda de boxes será ativado automaticamente.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setIsSubmittedPending(false);
                    setLoginEmail(submittedWorkshop.email);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#034EFE] text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-600 transition-colors"
                >
                  Ir para a Tela de Login
                </button>
                <a
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Página Inicial
                </a>
              </div>
            </div>
          ) : (
            /* Formulário de Cadastro da Oficina */
            <form onSubmit={handleRegister}>
              <CardHeader className="p-6 pb-2 border-b-0">
                <CardTitle className="text-xl font-bold text-[#00091D]">
                  Cadastrar Nova Oficina
                </CardTitle>
                <CardDescription>
                  Preencha os dados cadastrais para solicitar o credenciamento do seu estabelecimento no Grupo J.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-3.5">
                <Input
                  label="Nome Fantasia da Oficina *"
                  required
                  placeholder="Ex: Auto Center Mecânica Rápida"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  prefixIcon={<Building2 size={16} />}
                  disabled={isLoading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="CNPJ da Oficina *"
                    required
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    disabled={isLoading}
                  />

                  <Input
                    label="Telefone / WhatsApp *"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    prefixIcon={<Phone size={16} />}
                    disabled={isLoading}
                  />
                </div>

                <Input
                  label="Nome do Responsável / Titular *"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={isLoading}
                />

                <Input
                  label="E-mail Corporativo de Acesso *"
                  type="email"
                  required
                  placeholder="contato@suaoficina.com.br"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  prefixIcon={<Mail size={16} />}
                  disabled={isLoading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PasswordInput
                    label="Criar Senha *"
                    required
                    placeholder="Mínimo 6 dígitos"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isLoading}
                  />

                  <PasswordInput
                    label="Confirmar Senha *"
                    required
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-slate-300 text-[#034EFE] focus:ring-[#034EFE] shrink-0"
                  />
                  <label htmlFor="terms" className="cursor-pointer">
                    Concordo com os <span className="font-bold text-[#034EFE]">Termos de Parceria Credenciada</span> e a <span className="font-bold text-[#034EFE]">Política LGPD</span> do Grupo J.
                  </label>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20 bg-[#034EFE]"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {isLoading ? "Enviando Proposta..." : "Enviar Proposta para Aprovação"}
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  🔒 Sua proposta será enviada com status pendente para homologação da diretoria no Painel Central.
                </p>

                <div className="pt-2 text-center border-t border-slate-100 w-full">
                  <p className="text-xs text-slate-500">
                    Já possui cadastro ativo?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-bold text-[#034EFE] hover:underline"
                    >
                      Fazer Login
                    </button>
                  </p>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Rodapé Seguro */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Sessão protegida por criptografia AES-256 e conformidade com a LGPD (Lei 13.709/2018).
        </p>
      </div>
    </div>
  );
}

export default function WorkshopAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <WorkshopAuthForm />
    </Suspense>
  );
}
