import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const { voucherCode } = await request.json();
  if (!voucherCode) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Voucher ausente", status: 422, detail: "Informe o código do voucher." });
  const { data, error } = await auth.db.rpc("redeem_benefit_voucher", { p_voucher_token: String(voucherCode).trim() });
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/voucher-invalid", title: "Voucher não validado", status: error.message.includes("ALREADY") ? 409 : 422, detail: error.message });
  return createSuccessResponse(data);
}
