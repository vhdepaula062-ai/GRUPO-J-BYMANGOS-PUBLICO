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

  constructor(config: PagSeguroConfig) {
    this.token = config.token;
    this.webhookSecret = config.webhookSecret || "";
    void config.sandbox;
  }

  async createCustomer(_input: CreateCustomerInput): Promise<GatewayCustomer> {
    if (!this.token) {
      throw new Error("Token PagSeguro ausente. Configure PAGSEGURO_TOKEN.");
    }

    throw new Error("Adapter PagSeguro não ativado: configure e homologue o contrato oficial antes de cobrar clientes.");
  }

  async createSubscription(_input: CreateSubscriptionInput): Promise<GatewaySubscription> {
    if (!this.token) {
      throw new Error("Token PagSeguro ausente. Configure PAGSEGURO_TOKEN.");
    }

    throw new Error("Adapter PagSeguro não ativado: configure e homologue o contrato oficial antes de criar assinaturas.");
  }

  async getSubscription(_gatewaySubscriptionId: string): Promise<GatewaySubscription> {
    throw new Error("Adapter PagSeguro não ativado: consulta de assinatura indisponível.");
  }

  async cancelSubscription(_gatewaySubscriptionId: string): Promise<void> {
    if (!this.token) {
      throw new Error("Token PagSeguro ausente.");
    }
    throw new Error("Adapter PagSeguro não ativado: cancelamento de assinatura indisponível.");
  }

  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): boolean {
    if (!this.webhookSecret) {
      return false;
    }
    const signature = headers["x-pagseguro-signature"] || headers["x-signature"];
    if (!signature) return false;

    const expected = createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return signature === expected;
  }

  normalizeEvent(_payload: Record<string, unknown>): NormalizedPaymentEvent {
    throw new Error("Normalização indisponível: o contrato de eventos do provedor ainda não foi homologado.");
  }
}
