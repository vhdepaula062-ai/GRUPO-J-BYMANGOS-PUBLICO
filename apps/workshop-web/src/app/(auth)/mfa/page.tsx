"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ArrowLeft,
  Badge
} from "@grupo-j/ui-web";
import { createClient } from "@/lib/supabase/client";

type MfaMode = "checking" | "verify" | "enroll";

export default function WorkshopMfaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<MfaMode>("checking");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Dados para Inscrição (Enrollment)
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [secretText, setSecretText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const MAX_ATTEMPTS = 5;

  const initMfa = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;

      const verifiedFactor = factors.totp.find((item) => item.status === "verified");

      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
        setMode("verify");
      } else {
        // Iniciar fluxo de inscrição (enrollment)
        const unverified = (factors.all || factors.totp).find((item: any) => item.status === "unverified");
        if (unverified) {
          await supabase.auth.mfa.unenroll({ factorId: unverified.id });
        }

        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          issuer: "Grupo J Oficinas",
          friendlyName: `Oficina (${user.email || "Parceiro"})`
        });

        if (enrollError) throw enrollError;

        setFactorId(enrollData.id);
        setQrCodeSvg(enrollData.totp.qr_code);
        setSecretText(enrollData.totp.secret);
        setMode("enroll");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Não foi possível carregar as configurações de segurança."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initMfa();
  }, [initMfa]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || code.length < 6 || !factorId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      });

      if (verifyError) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          throw new Error("Limite de tentativas excedido. Aguarde 5 minutos ou refaça o login.");
        }
        throw new Error(
          `Código inválido. Restam ${MAX_ATTEMPTS - nextAttempts} tentativa(s).`
        );
      }

      setSuccessMessage("Identidade confirmada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.replace("/painel");
      }, 500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao validar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6 || !factorId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      });

      if (verifyError) {
        throw new Error("Código de confirmação incorreto. Verifique o relógio do seu autenticador e tente novamente.");
      }

      setSuccessMessage("Segundo fator (MFA) registrado com sucesso! Redirecionando ao painel...");
      setTimeout(() => {
        router.replace("/painel");
      }, 800);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao confirmar segundo fator.");
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (secretText) {
      navigator.clipboard.writeText(secretText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-left">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <GrupoJLogo variant="light" subtitle="PORTAL DAS OFICINAS" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#034EFE] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} className="text-[#034EFE]" />
            <span>Verificação em Duas Etapas (MFA)</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Segurança reforçada para proteção dos dados da sua oficina credenciada.
          </p>
        </div>

        <Card variant="elevated" className="border border-slate-200/80 shadow-xl bg-white">
          {mode === "checking" && (
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Verificando status de segurança...</p>
            </CardContent>
          )}

          {mode === "verify" && (
            <>
              <CardHeader className="p-6 pb-2 border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl font-bold text-[#00091D]">
                    Código de Segurança (TOTP)
                  </CardTitle>
                  <Badge variant="success">Fator Registrado</Badge>
                </div>
                <CardDescription>
                  Digite o código de 6 dígitos gerado pelo seu app autenticador.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleVerify}>
                <CardContent className="p-6 space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                      {successMessage}
                    </div>
                  )}

                  <Input
                    label="Código de 6 dígitos"
                    type="text"
                    required
                    maxLength={6}
                    disabled={isLocked}
                    placeholder="000 000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center tracking-[0.5em] text-2xl font-mono font-bold h-14"
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Tentativas restantes: {Math.max(0, MAX_ATTEMPTS - attempts)}</span>
                    <button
                      type="button"
                      onClick={initMfa}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Atualizar
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
                    isLoading={isLoading}
                    disabled={code.length < 6 || isLocked}
                  >
                    Confirmar e Acessar Painel
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#034EFE] transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>Voltar para o login</span>
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </>
          )}

          {mode === "enroll" && (
            <>
              <CardHeader className="p-6 pb-2 border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl font-bold text-[#00091D]">
                    Ativar Segundo Fator (MFA)
                  </CardTitle>
                  <Badge variant="warning">Recomendado</Badge>
                </div>
                <CardDescription>
                  Escaneie o código QR com seu autenticador (Google Authenticator, Microsoft Authenticator, 1Password ou Authy).
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleEnrollVerify}>
                <CardContent className="p-6 space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                      {successMessage}
                    </div>
                  )}

                  {qrCodeSvg && (
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <img
                        src={qrCodeSvg}
                        alt="QR Code TOTP"
                        className="w-48 h-48 rounded-lg shadow-sm border border-slate-100"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">
                        Escaneie com a câmera do seu autenticador
                      </p>
                    </div>
                  )}

                  {secretText && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-700">Chave secreta manual:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={secretText}
                          className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-800 select-all"
                        />
                        <button
                          type="button"
                          onClick={copySecret}
                          className="px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shrink-0 transition"
                        >
                          {copied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  )}

                  <Input
                    label="Código de 6 dígitos gerado pelo App"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000 000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center tracking-[0.5em] text-2xl font-mono font-bold h-14"
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
                    Ativar MFA e Continuar
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#034EFE] transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>Voltar para o login</span>
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
