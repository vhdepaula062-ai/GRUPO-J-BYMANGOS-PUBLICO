import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";
import { checkRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, {
    maxRequests: 20,
    windowMs: 60000,
    keyPrefix: "voucher-validate"
  });
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const body = await request.json().catch(() => ({}));
  const voucherCode = typeof body?.voucherCode === "string" ? body.voucherCode.trim().toUpperCase() : "";
  if (!/^(?:[A-F0-9]{24}|[A-F0-9]{32})$/.test(voucherCode)) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/validation-error", title: "Voucher inválido", status: 422, detail: "Informe um código de voucher válido." });
  const { data, error } = await auth.db.rpc("redeem_benefit_voucher", { p_voucher_token: voucherCode });
  if (error) {
    const isForbidden = error.message.includes("WORKSHOP_MISMATCH") || error.message.includes("MEMBERSHIP_REQUIRED");
    const isConflict = error.message.includes("ALREADY");
    return createProblemResponse({
      type: isForbidden ? "https://api.grupoj.com.br/v1/errors/workshop-forbidden" : "https://api.grupoj.com.br/v1/errors/voucher-invalid",
      title: isForbidden ? "Acesso não autorizado para esta oficina" : "Voucher não validado",
      status: isForbidden ? 403 : isConflict ? 409 : 422,
      detail: isForbidden ? "Acesso não autorizado para esta oficina." : isConflict ? "Este voucher já foi utilizado." : "Confira o código, a validade e a elegibilidade do voucher."
    });
  }
  return createSuccessResponse(data);
}
