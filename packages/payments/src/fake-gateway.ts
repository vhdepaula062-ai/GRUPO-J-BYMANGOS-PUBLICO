import {
  PaymentGateway,
  CreateCustomerInput,
  GatewayCustomer,
  CreateSubscriptionInput,
  GatewaySubscription,
  NormalizedPaymentEvent
} from "./gateway.interface";

export class FakePaymentGateway implements PaymentGateway {
  constructor() {
    if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
      throw new Error(
        "VIOLAÇÃO CRÍTICA DE SEGURANÇA: O FakePaymentGateway está terminantemente bloqueado em ambiente de PRODUÇÃO."
      );
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<GatewayCustomer> {
    return {
      gatewayCustomerId: `fake_cust_${Date.now()}`,
      email: input.email
    };
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<GatewaySubscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    return {
      gatewaySubscriptionId: `fake_sub_${input.idempotencyKey.slice(0, 8)}`,
      status: "active",
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
    // Simulação de cancelamento
  }

  verifyWebhookSignature(_headers: Record<string, string>, _rawBody: string): boolean {
    // Em desenvolvimento e testes aceita
    return true;
  }

  normalizeEvent(payload: Record<string, unknown>): NormalizedPaymentEvent {
    return {
      eventId: (payload.id as string) || `evt_${Date.now()}`,
      eventType: "payment_approved",
      gatewaySubscriptionId: payload.subscription_id as string | undefined,
      amountCents: (payload.amount as number) || 5000,
      occurredAt: new Date().toISOString(),
      rawPayload: payload
    };
  }
}
