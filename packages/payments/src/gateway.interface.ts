import { SubscriptionStatus } from "@grupo-j/types";

export interface CreateCustomerInput {
  email: string;
  name: string;
  phone?: string;
  taxIdMasked?: string;
}

export interface GatewayCustomer {
  gatewayCustomerId: string;
  email: string;
}

export interface CreateSubscriptionInput {
  gatewayCustomerId: string;
  planCode: string;
  amountCents: number;
  paymentMethodToken: string;
  idempotencyKey: string;
}

export interface GatewaySubscription {
  gatewaySubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface WebhookEventPayload {
  id: string;
  type: string;
  action: string;
  data: {
    id: string;
  };
}

export interface NormalizedPaymentEvent {
  eventId: string;
  eventType: "payment_approved" | "payment_failed" | "subscription_canceled";
  gatewaySubscriptionId?: string;
  amountCents?: number;
  occurredAt: string;
  rawPayload: Record<string, unknown>;
}

export interface PaymentGateway {
  createCustomer(input: CreateCustomerInput): Promise<GatewayCustomer>;
  createSubscription(input: CreateSubscriptionInput): Promise<GatewaySubscription>;
  getSubscription(gatewaySubscriptionId: string): Promise<GatewaySubscription>;
  cancelSubscription(gatewaySubscriptionId: string): Promise<void>;
  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean;
  normalizeEvent(payload: Record<string, unknown>): NormalizedPaymentEvent;
}
