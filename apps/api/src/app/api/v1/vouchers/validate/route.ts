import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const { voucherCode } = await request.json();
  if (!voucherCode) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Voucher ausente", status: 422, detail: "Informe o código do voucher." });
  const { data, error } = await auth.db.rpc("redeem_benefit_voucher", { p_voucher_token: String(voucherCode).trim() });
  if (error) {
    const isForbidden = error.message.includes("WORKSHOP_MISMATCH") || error.message.includes("MEMBERSHIP_REQUIRED");
    const isConflict = error.message.includes("ALREADY");
    return createProblemResponse({
      type: isForbidden ? "https://api.grupoj.com.br/v1/errors/workshop-forbidden" : "https://api.grupoj.com.br/v1/errors/voucher-invalid",
      title: isForbidden ? "Acesso não autorizado para esta oficina" : "Voucher não validado",
      status: isForbidden ? 403 : isConflict ? 409 : 422,
      detail: error.message
    });
  }
  return createSuccessResponse(data);
}
