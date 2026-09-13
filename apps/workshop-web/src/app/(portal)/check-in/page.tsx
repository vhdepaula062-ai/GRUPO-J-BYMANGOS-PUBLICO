"use client";

import React, { useState, useTransition } from "react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Button,
  Zap,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from "@grupo-j/ui-web";
import { validateVoucherAction, type ValidateVoucherResult } from "./actions";

export default function CheckInPage() {
  const [voucherToken, setVoucherToken] = useState("");
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidateVoucherResult | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationResult(null);

    startTransition(async () => {
      const res = await validateVoucherAction({
        voucherToken,
        plate,
        odometer
      });
      setValidationResult(res);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Validação de Voucher & Check-in"
        subtitle="Consulte o código gerado no aplicativo do motorista ou a placa do veículo para liberar o atendimento preventivo."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="md:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-[#034EFE] rounded-lg">
                  <Zap className="w-5 h-5" />
                </span>
                <div>
                  <CardTitle>Entrada de Box / Validação</CardTitle>
                  <CardDescription>
                    Insira o voucher de 6 a 8 dígitos ou a placa do veículo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleValidate}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Código do Voucher (Apresentado pelo Cliente)
                  </label>
                  <Input
                    placeholder="Ex: GJ-94021"
                    value={voucherToken}
                    onChange={(e) => setVoucherToken(e.target.value.toUpperCase())}
                    className="font-mono text-base uppercase tracking-widest"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    O cliente gera esse código na aba &quot;Benefícios&quot; do app dele.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Placa do Veículo (Opcional)
                    </label>
                    <Input
                      placeholder="Ex: BRA2E19"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      className="font-mono uppercase tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Km Atual (Odômetro)
                    </label>
                    <Input
                      placeholder="Ex: 48500"
                      type="number"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                    />
                  </div>
                </div>

                {validationResult && (
                  <div
                    className={`p-4 rounded-xl border mt-4 animate-in fade-in flex items-start gap-3 ${
                      validationResult.valid
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    {validationResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-sm">
                        {validationResult.valid ? "Atendimento Autorizado" : "Validação Não Aprovada"}
                      </p>
                      <p>{validationResult.message}</p>
                      {validationResult.customerName && (
                        <p className="font-semibold text-slate-800 pt-1">
                          Motorista: {validationResult.customerName}
                          {validationResult.vehicleModel ? ` • ${validationResult.vehicleModel}` : ""}
                        </p>
                      )}
                      {validationResult.benefitName && (
                        <p className="text-emerald-700 font-bold">
                          Serviço: {validationResult.benefitName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500 text-center sm:text-left">
                  Liquidação do repasse em até 2 dias úteis
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isPending || (!voucherToken && !plate)}
                  className="w-full sm:w-auto bg-[#034EFE] hover:bg-blue-700 font-bold px-6"
                >
                  {isPending ? "Validando no Banco..." : "Consultar & Validar"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Instruções de Operação */}
        <div className="space-y-4">
          <Card variant="default">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Passo a Passo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>Peça ao motorista para exibir o voucher ativo na tela do celular dele.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>Digite o código acima e confirme a placa do carro no balcão.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p>Realize o procedimento preventivo no box mecânico.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <p>O repasse financeiro do serviço será lançado automaticamente no seu extrato.</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">Garantia Grupo J</p>
              <p className="text-[11px] text-slate-500">
                Todo atendimento validado possui repasse garantido pelo Grupo J.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
