import { describe, expect, it } from "vitest";
import { PagSeguroPaymentGateway } from "./pagseguro-gateway";
import { MercadoPagoPaymentGateway } from "./mercadopago-gateway";
describe("unconfigured real providers", () => {
  const providers = [new PagSeguroPaymentGateway({ token: "" }), new MercadoPagoPaymentGateway({ accessToken: "", webhookSecret: "" })];
  for (const gateway of providers) {
    it(`${gateway.constructor.name} never turns unknown or merely authorized events into paid money`, () => {
      for (const payload of [{ id: "event" }, { id: "event", status: "AUTHORIZED" }, { id: "event", type: "payment.created" }, { id: "event", status: "PAID" }]) {
        expect(() => gateway.normalizeEvent(payload)).toThrow(/homologado/);
      }
      expect(gateway.verifyWebhookSignature({}, "{}")).toBe(false);
    });
  }
});
