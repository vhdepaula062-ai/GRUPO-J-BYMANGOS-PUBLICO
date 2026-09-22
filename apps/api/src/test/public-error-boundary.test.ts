import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), limit: vi.fn(), verifyOtp: vi.fn(), refreshSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  authenticateRequest: async () => ({ user: { id: "operator" }, db: { rpc: state.rpc, from: state.from } }),
  isAuthFailure: () => false,
  getPublicDatabase: () => ({ auth: { verifyOtp: state.verifyOtp, refreshSession: state.refreshSession } })
}));
vi.mock("@/lib/rate-limiter", () => ({ checkRateLimit: state.limit }));

import { POST as redeemVoucher } from "../app/api/v1/vouchers/validate/route";
import { POST as changeWorkshop } from "../app/api/v1/workshops/change-request/route";
import { POST as createOrder } from "../app/api/v1/service-orders/route";
import { POST as verifyEmail } from "../app/api/v1/auth/verify/route";
import { POST as refreshSession } from "../app/api/v1/auth/refresh/route";

const uuid = "00000000-0000-4000-8000-000000000001";
const request = (path: string, body: unknown) => new NextRequest(`http://localhost/api/v1/${path}`, {
  method: "POST", body: JSON.stringify(body)
});

describe("public API error boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.limit.mockResolvedValue(null);
    state.from.mockImplementation((table: string) => {
      if (table === "organization_members") {
        const query: any = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { organization_id: uuid } }) };
        return query;
      }
      const query: any = { insert: () => query, select: () => query, single: async () => ({ error: { message: "private SQL policy and user data" } }) };
      return query;
    });
  });

  it("rejects malformed voucher codes before calling the database", async () => {
    const response = await redeemVoucher(request("vouchers/validate", { voucherCode: "A".repeat(100_000) }));
    expect(response.status).toBe(422);
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("does not return database errors from voucher redemption", async () => {
    state.rpc.mockResolvedValue({ error: { message: "private SQL policy and user data" } });
    const response = await redeemVoucher(request("vouchers/validate", { voucherCode: "A".repeat(32) }));
    expect(response.status).toBe(422);
    expect(await response.text()).not.toContain("private SQL policy");
  });

  it("does not return database errors from workshop changes", async () => {
    state.rpc.mockResolvedValue({ error: { message: "private SQL policy and user data" } });
    const response = await changeWorkshop(request("workshops/change-request", { workshopId: uuid }));
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("private SQL policy");
  });

  it("rejects privileged extra fields and hides order insertion errors", async () => {
    const invalid = await createOrder(request("service-orders", { customerId: uuid, vehicleId: uuid, status: "completed" }));
    expect(invalid.status).toBe(422);
    expect(state.from).not.toHaveBeenCalled();
    const response = await createOrder(request("service-orders", { customerId: uuid, vehicleId: uuid }));
    expect(response.status).toBe(422);
    expect(await response.text()).not.toContain("private SQL policy");
  });

  it("limits public token endpoints before contacting the identity provider", async () => {
    state.limit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    expect((await verifyEmail(request("auth/verify", { email: "person@example.test", code: "123456" }))).status).toBe(429);
    state.limit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    expect((await refreshSession(request("auth/refresh", { refreshToken: "x".repeat(32) }))).status).toBe(429);
    expect(state.verifyOtp).not.toHaveBeenCalled();
    expect(state.refreshSession).not.toHaveBeenCalled();
  });

  it("rejects oversized tokens and extra verification fields", async () => {
    expect((await verifyEmail(request("auth/verify", { email: "person@example.test", code: "123456", role: "admin" }))).status).toBe(422);
    expect((await refreshSession(request("auth/refresh", { refreshToken: "x".repeat(5000) }))).status).toBe(401);
    expect(state.verifyOtp).not.toHaveBeenCalled();
    expect(state.refreshSession).not.toHaveBeenCalled();
  });
});
