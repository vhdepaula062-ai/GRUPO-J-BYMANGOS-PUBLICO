"use client";

import React, { useState } from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  CheckCircle2,
  Building2
} from "@grupo-j/ui-web";
import { updateWorkshopProfile } from "./actions";

interface Props {
  initialData?: {
    trade_name?: string;
    legal_name?: string;
    email?: string;
    phone?: string;
  };
}

export function ConfiguracoesClient({ initialData }: Props) {
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tradeName, setTradeName] = useState(initialData?.trade_name || "");
  const [legalName, setLegalName] = useState(initialData?.legal_name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setErrorMessage(null);
    try {
      await updateWorkshopProfile({ tradeName, legalName, email, phone });
      setSaved(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar as alterações.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      <PageHeader
        title="Configurações da Oficina Credenciada"
        subtitle="Dados cadastrais, horário de funcionamento e canais de contato visíveis aos motoristas."
      />

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}
      {errorMessage && <p className="p-4 rounded-xl bg-rose-50 text-sm text-rose-700">{errorMessage}</p>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identificação Cadastral */}
        <Card variant="elevated">
          <CardHeader>
            <div>
              <CardTitle>Perfil do Estabelecimento</CardTitle>
              <CardDescription>Informações registradas no ecossistema Grupo J.</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Nome Fantasia da Oficina"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Razão Social LTDA/ME"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@oficina.com.br"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#034EFE]/20"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
            <Button type="submit" variant="primary" size="md" className="bg-[#034EFE] font-bold">
              Salvar Alterações
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
