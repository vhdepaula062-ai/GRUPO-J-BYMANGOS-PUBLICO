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
  Input,
  Button,
  Badge,
  Zap,
  CheckCircle2,
  Clock,
  Car,
  ShieldCheck,
  AlertCircle
} from "@grupo-j/ui-web";

export default function CheckInPage() {
  const [voucherToken, setVoucherToken] = useState("");
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    benefitName?: string;
    customerName?: string;
    vehicleModel?: string;
    message?: string;
  } | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationResult(null);

    setTimeout(() => {
      setIsValidating(false);
      if (voucherToken.length >= 5 && plate.length >= 7) {
        setValidationResult({
          valid: true,
          benefitName: "Alinhamento 3D e Balanceamento",
          customerName: "João Pedro Silva",
          vehicleModel: "Volkswagen Gol 1.6 MSI (2022)",
          message: "Benefício preventivo autorizado com sucesso. Motorista com assinatura ativa e sem pendências."
        });
      } else {
        setValidationResult({
          valid: false,
          message: "Voucher não localizado ou placa incorreta. Verifique o código apresentado no app do cliente."
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      <PageHeader
        title="Check-in de Veículo & Validador de Voucher"
        subtitle="Validação instantânea de tokens de benefício preventivo com proteção contra duplicidade."
        actions={
          <Badge variant="info" size="md">
            <Clock size={13} className="mr-1 inline" />
            Tokens com validade de 120s
          </Badge>
        }
      />

      <Card variant="elevated">
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Validação do Benefício</CardTitle>
            <CardDescription>
              Peça ao motorista para abrir a aba &quot;Benefícios&quot; no aplicativo Grupo J e digitar o código gerado.
            </CardDescription>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#034EFE] flex items-center justify-center shrink-0">
            <Zap size={20} className="text-amber-500" />
          </div>
        </CardHeader>

        <form onSubmit={handleValidate}>
          <CardContent className="space-y-4">
            <Input
              label="Código do Voucher (ou Token QR Code)"
              required
              placeholder="Ex: GJ-94021"
              value={voucherToken}
              onChange={(e) => setVoucherToken(e.target.value.toUpperCase())}
              prefixIcon={<Zap size={16} className="text-amber-500" />}
              helperText="O voucher é temporário (120 segundos) para impedir o reaproveitamento."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Placa do Veículo"
                required
                maxLength={8}
                placeholder="ABC1D23"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                prefixIcon={<Car size={16} />}
              />
              <Input
                label="Quilometragem Atual (Km)"
                type="number"
                placeholder="Ex: 45000"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
              isLoading={isValidating}
            >
              Verificar Elegibilidade do Benefício
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Resultado da Validação */}
      {validationResult && (
        <Card
          className={
            validationResult.valid
              ? "border-emerald-200 bg-emerald-50/40 animate-in fade-in"
              : "border-red-200 bg-red-50/40 animate-in fade-in"
          }
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  validationResult.valid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {validationResult.valid ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-[#00091D]">
                    {validationResult.valid
                      ? validationResult.benefitName
                      : "Validação Recusada"}
                  </h4>
                  {validationResult.valid && (
                    <Badge variant="success" size="sm">
                      Autorizado
                    </Badge>
                  )}
                </div>

                {validationResult.valid && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                    <p>
                      <strong>Motorista:</strong> {validationResult.customerName}
                    </p>
                    <p>
                      <strong>Veículo:</strong> {validationResult.vehicleModel} — Placa:{" "}
                      <span className="font-mono font-bold">{plate}</span>
                    </p>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {validationResult.message}
                </p>

                {validationResult.valid && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      leftIcon={<CheckCircle2 size={16} />}
                      onClick={() => alert("Atendimento iniciado com sucesso! O voucher foi liquidado.")}
                    >
                      Confirmar e Abrir Ordem de Serviço
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
