import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { getAdminDatabase } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

function safeSignature(expected: string, received: string) {
  const a = Buffer.from(expected); const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const provider = process.env.PAYMENT_GATEWAY_PROVIDER;
  const secret = provider === "pagseguro" ? process.env.PAGSEGURO_WEBHOOK_SECRET : process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const received = request.headers.get("x-signature") ?? request.headers.get("x-pagseguro-signature") ?? "";
  if (!provider || provider === "fake" || !secret) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/webhook-not-configured", title: "Webhook não configurado", status: 503, detail: "O provedor e o segredo do webhook precisam ser configurados." });
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!safeSignature(expected, received.replace(/^sha256=/, ""))) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-signature", title: "Assinatura inválida", status: 401, detail: "O evento não foi processado." });

  let payload: Record<string, any>;
  try { payload = JSON.parse(rawBody); } catch { return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-json", title: "Payload inválido", status: 400, detail: "O corpo precisa ser JSON." }); }
  const eventId = String(payload.id ?? payload.event_id ?? payload.data?.id ?? "");
  const eventType = String(payload.type ?? payload.event ?? payload.status ?? "unknown");
  if (!eventId) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/invalid-webhook", title: "Evento sem identificador", status: 400, detail: "O provedor precisa enviar um ID idempotente." });
  const db = getAdminDatabase();
  const { data: inserted, error: insertError } = await db.from("payment_webhook_events").insert({ provider, provider_event_id: eventId, event_type: eventType, payload }).select("id").maybeSingle();
  if (insertError?.code === "23505") return createSuccessResponse({ received: true, duplicate: true, eventId });
  if (insertError || !inserted) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/webhook-storage-failed", title: "Evento não persistido", status: 503, detail: insertError?.message ?? "Falha de persistência." });
  try {
    const gatewaySubscriptionId = payload.subscription_id ?? payload.data?.subscription_id ?? payload.reference_id;
    if (gatewaySubscriptionId) {
      const normalized = eventType.toLowerCase();
      const status = normalized.includes("paid") || normalized.includes("approved") || normalized.includes("renewed") ? "active" : normalized.includes("cancel") ? "canceled" : normalized.includes("fail") || normalized.includes("declin") ? "past_due" : null;
      if (status) await db.from("subscriptions").update({ status, updated_at: new Date().toISOString() }).eq("gateway_subscription_id", gatewaySubscriptionId);
    }
    await db.from("payment_webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", inserted.id);
    return createSuccessResponse({ received: true, eventId });
  } catch (error) {
    await db.from("payment_webhook_events").update({ status: "failed", error_message: error instanceof Error ? error.message : "Erro interno" }).eq("id", inserted.id);
    return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/webhook-processing-failed", title: "Evento persistido, mas não processado", status: 500, detail: "O evento poderá ser reprocessado com segurança." });
  }
}
