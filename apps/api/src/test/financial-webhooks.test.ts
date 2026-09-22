import { describe, expect, it } from "vitest";
import { POST } from "../app/api/v1/webhooks/payments/route";
import { POST as alias } from "../app/api/v1/webhooks/payment-provider/route";
describe("webhooks awaiting gateway homologation", () => {
  it("does not acknowledge unprocessed financial events", async () => {
    expect((await POST()).status).toBe(503);
    expect((await alias()).status).toBe(503);
  });
});
