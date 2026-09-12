"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button } from "@grupo-j/ui-web";

export default function CheckInPage() {
  const [voucherToken, setVoucherToken] = useState("");
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    benefitName?: string;
    message?: string;
  } | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationResult(null);

    // Validação simulada do voucher com as regras da fundação
    setTimeout(() => {
      setIsValidating(false);
      if (voucherToken.length >= 6 && plate.length >= 7) {
        setValidationResult({
          valid: true,
          benefitName: "Alinhamento 3D e Balanceamento",
          message: "Benefício autorizado com sucesso! Veículo com assinatura ativa e sem impedimentos."
        });
      } else {
        setValidationResult({
          valid: false,
          message: "Token de voucher ou placa não localizados. Verifique os dados com o motorista."
        });
      }
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check-in de Veículo & Resgate de Benefício</h1>
        <p className="text-sm text-slate-500 mt-1">
          Insira o código apresentado no aplicativo do motorista para validação automática de elegibilidade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validador de Voucher</CardTitle>
          <CardDescription>
            O voucher possui validade máxima de 120 segundos para prevenir fraudes de duplicidade.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleValidate}>
          <CardContent className="space-y-4">
            <Input
              label="Código do Voucher (ou Token QR Code)"
              required
              placeholder="Ex: GJ-884920"
              value={voucherToken}
              onChange={(e) => setVoucherToken(e.target.value.toUpperCase())}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Placa do Veículo"
                required
                maxLength={8}
                placeholder="ABC1D23"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
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
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" variant="primary" className="w-full h-11" isLoading={isValidating}>
              Validar Elegibilidade do Benefício
            </Button>
          </CardFooter>
        </form>
      </Card>

      {validationResult && (
        <Card className={validationResult.valid ? "border-emerald-300 bg-emerald-50/40" : "border-red-300 bg-red-50/40"}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{validationResult.valid ? "✅" : "❌"}</span>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {validationResult.valid ? validationResult.benefitName : "Validação Recusada"}
                </h4>
                <p className="text-sm text-slate-600 mt-1">{validationResult.message}</p>
                {validationResult.valid && (
                  <div className="mt-4">
                    <Button size="sm" variant="primary">
                      Confirmar Início do Atendimento
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
