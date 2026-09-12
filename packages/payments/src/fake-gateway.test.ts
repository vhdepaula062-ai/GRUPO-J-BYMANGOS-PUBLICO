import { describe, it, expect } from "vitest";
import { FakePaymentGateway } from "./fake-gateway";

describe("FakePaymentGateway", () => {
  it("deve criar cliente e assinatura em centavos para testes", async () => {
    const gateway = new FakePaymentGateway();

    const customer = await gateway.createCustomer({
      email: "teste@motorista.com.br",
      name: "Motorista Teste"
    });
    expect(customer.gatewayCustomerId).toBeDefined();

    const sub = await gateway.createSubscription({
      gatewayCustomerId: customer.gatewayCustomerId,
      planCode: "DRIVER_BASIC_50",
      amountCents: 5000,
      paymentMethodToken: "tok_visa_123",
      idempotencyKey: "idem-key-99999"
    });

    expect(sub.status).toBe("active");
    expect(sub.gatewaySubscriptionId).toContain("fake_sub_");
  });

  it("deve normalizar eventos de pagamento", () => {
    const gateway = new FakePaymentGateway();
    const event = gateway.normalizeEvent({ id: "evt_123", amount: 5000 });
    expect(event.eventType).toBe("payment_approved");
    expect(event.amountCents).toBe(5000);
  });
});
