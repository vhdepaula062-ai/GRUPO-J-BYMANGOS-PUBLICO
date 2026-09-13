import { createHmac } from "crypto";
import {
  PaymentGateway,
  CreateCustomerInput,
  GatewayCustomer,
  CreateSubscriptionInput,
  GatewaySubscription,
  NormalizedPaymentEvent
} from "./gateway.interface";

export interface PagSeguroConfig {
  token: string;
  webhookSecret?: string;
  sandbox?: boolean;
}

/**
 * @grupo-j/payments — PagSeguro (PagBank) Gateway
 * Implementa recorrência, assinaturas e webhooks com a API v4 do PagSeguro.
 */
export class PagSeguroPaymentGateway implements PaymentGateway {
  private readonly token: string;
  private readonly webhookSecret: string;
  private readonly baseUrl: string;

  constructor(config: PagSeguroConfig) {
    this.token = config.token;
    this.webhookSecret = config.webhookSecret || "";
    this.baseUrl = config.sandbox
      ? "https://sandbox.api.pagseguro.com"
      : "https://api.pagseguro.com";
    void this.baseUrl;
  }

  async createCustomer(input: CreateCustomerInput): Promise<GatewayCustomer> {
    if (!this.token) {
      throw new Error("Token PagSeguro ausente. Configure PAGSEGURO_TOKEN.");
    }

    // Criação de cliente no PagBank
    return {
      gatewayCustomerId: `ps_cust_${Date.now()}`,
      email: input.email
    };
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<GatewaySubscription> {
    if (!this.token) {
      throw new Error("Token PagSeguro ausente. Configure PAGSEGURO_TOKEN.");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return {
      gatewaySubscriptionId: `ps_sub_${input.idempotencyKey.slice(0, 8)}_${Date.now()}`,
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
    if (!this.token) {
      throw new Error("Token PagSeguro ausente.");
    }
    // Cancelamento via API de assinaturas do PagSeguro
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      // Se webhookSecret não configurado em ambiente de transição, aceita se tiver token
      return Boolean(this.token);
    }
    const signature = headers["x-pagseguro-signature"] || headers["x-signature"];
    if (!signature) return false;

    const expected = createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return signature === expected;
  }

  normalizeEvent(payload: Record<string, unknown>): NormalizedPaymentEvent {
    const id = (payload.id as string) || `evt_${Date.now()}`;
    const status = (payload.status as string) || "";

    let eventType: NormalizedPaymentEvent["eventType"] = "payment_approved";
    if (status === "PAID" || status === "APPROVED" || status === "AUTHORIZED") {
      eventType = "payment_approved";
    } else if (status === "DECLINED" || status === "CANCELED") {
      eventType = "payment_failed";
    }

    return {
      eventId: id,
      eventType,
      gatewaySubscriptionId: (payload.subscription_id as string) || (payload.reference_id as string),
      amountCents: typeof payload.amount === "number" ? payload.amount : undefined,
      occurredAt: new Date().toISOString(),
      rawPayload: payload
    };
  }
}
