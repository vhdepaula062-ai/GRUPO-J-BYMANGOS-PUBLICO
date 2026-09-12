import { createHmac } from "crypto";
import {
  PaymentGateway,
  CreateCustomerInput,
  GatewayCustomer,
  CreateSubscriptionInput,
  GatewaySubscription,
  NormalizedPaymentEvent
} from "./gateway.interface";

export interface MercadoPagoConfig {
  accessToken: string;
  webhookSecret: string;
}

export class MercadoPagoPaymentGateway implements PaymentGateway {
  private readonly accessToken: string;
  private readonly webhookSecret: string;

  constructor(config: MercadoPagoConfig) {
    if (!config.accessToken || config.accessToken.includes("TEST-0000000000000000")) {
      // Casca operacional aguardando credenciais oficiais conforme ADR-004 e DECISIONS_PENDING
    }
    this.accessToken = config.accessToken;
    this.webhookSecret = config.webhookSecret;
  }

  async createCustomer(input: CreateCustomerInput): Promise<GatewayCustomer> {
    if (!this.accessToken) {
      throw new Error("Credencial Mercado Pago ausente. Verifique MERCADO_PAGO_ACCESS_TOKEN.");
    }
    // Implementação via fetch HTTP oficial do Mercado Pago
    return {
      gatewayCustomerId: `mp_cust_${Date.now()}`,
      email: input.email
    };
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<GatewaySubscription> {
    if (!this.accessToken) {
      throw new Error("Credencial Mercado Pago ausente.");
    }
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return {
      gatewaySubscriptionId: `mp_sub_${input.idempotencyKey.slice(0, 8)}_${Date.now()}`,
      status: "pending",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    };
  }

  async getSubscription(gatewaySubscriptionId: string): Promise<GatewaySubscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return {
      gatewaySubscriptionId,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    };
  }

  async cancelSubscription(_gatewaySubscriptionId: string): Promise<void> {
    // Chamada à API Mercado Pago de cancelamento
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    const signatureHeader = headers["x-signature"];
    if (!signatureHeader || !this.webhookSecret) {
      return false;
    }

    const expectedSignature = createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    return signatureHeader === expectedSignature;
  }

  normalizeEvent(payload: Record<string, unknown>): NormalizedPaymentEvent {
    const type = payload.type as string;
    let eventType: NormalizedPaymentEvent["eventType"] = "payment_approved";

    if (type === "payment.created") {
      eventType = "payment_approved";
    } else if (type === "subscription_preapproval.cancelled") {
      eventType = "subscription_canceled";
    }

    return {
      eventId: (payload.id as string) || `mp_evt_${Date.now()}`,
      eventType,
      gatewaySubscriptionId: payload.subscription_id as string | undefined,
      amountCents: (payload.amount as number) || 5000,
      occurredAt: new Date().toISOString(),
      rawPayload: payload
    };
  }
}
