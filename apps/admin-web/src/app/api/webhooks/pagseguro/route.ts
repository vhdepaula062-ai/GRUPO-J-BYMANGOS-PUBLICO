import { NextRequest, NextResponse } from "next/server";
import { PagSeguroPaymentGateway } from "@grupo-j/payments";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headers[key] = val;
    });

    const token = process.env.PAGSEGURO_TOKEN || "";
    const webhookSecret = process.env.PAGSEGURO_WEBHOOK_SECRET || "";

    const gateway = new PagSeguroPaymentGateway({
      token,
      webhookSecret,
      sandbox: process.env.NODE_ENV !== "production"
    });

    // Se estiver em produção com chaves, valida assinatura
    if (token && webhookSecret && !gateway.verifyWebhookSignature(headers, rawBody)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "{}");
    const event = gateway.normalizeEvent(payload);

    const supabase = createServerSupabaseClient();

    // Registra a transação e atualiza a assinatura se aplicável
    if (event.gatewaySubscriptionId) {
      if (event.eventType === "payment_approved") {
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", event.gatewaySubscriptionId);
      } else if (event.eventType === "payment_failed") {
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString()
          })
          .eq("id", event.gatewaySubscriptionId);
      }
    }

    // Registra na trilha de auditoria
    await supabase.from("audit_logs").insert({
      action: `PAYMENT_WEBHOOK_${event.eventType.toUpperCase()}`,
      table_name: "payment_transactions",
      record_id: event.eventId,
      ip_address: req.headers.get("x-forwarded-for") || "webhook.pagseguro"
    });

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[pagseguro_webhook] Erro:", err);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
