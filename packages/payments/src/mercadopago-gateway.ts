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

  async createCustomer(_input: CreateCustomerInput): Promise<GatewayCustomer> {
    if (!this.accessToken) {
      throw new Error("Credencial Mercado Pago ausente. Verifique MERCADO_PAGO_ACCESS_TOKEN.");
    }
    throw new Error("Adapter Mercado Pago não ativado: configure e homologue o contrato oficial antes de cobrar clientes.");
  }

  async createSubscription(_input: CreateSubscriptionInput): Promise<GatewaySubscription> {
    if (!this.accessToken) {
      throw new Error("Credencial Mercado Pago ausente.");
    }
    throw new Error("Adapter Mercado Pago não ativado: configure e homologue o contrato oficial antes de criar assinaturas.");
  }

  async getSubscription(_gatewaySubscriptionId: string): Promise<GatewaySubscription> {
    throw new Error("Adapter Mercado Pago não ativado: consulta de assinatura indisponível.");
  }

  async cancelSubscription(_gatewaySubscriptionId: string): Promise<void> {
    throw new Error("Adapter Mercado Pago não ativado: cancelamento de assinatura indisponível.");
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

    const eventId = payload.id as string | undefined;
    if (!eventId) throw new Error("Webhook Mercado Pago sem identificador do evento.");
    return {
      eventId,
      eventType,
      gatewaySubscriptionId: payload.subscription_id as string | undefined,
      amountCents: (payload.amount as number) || 5000,
      occurredAt: new Date().toISOString(),
      rawPayload: payload
    };
  }
}
