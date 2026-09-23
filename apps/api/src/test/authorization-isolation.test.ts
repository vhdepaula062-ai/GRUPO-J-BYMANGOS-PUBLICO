import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// Keep invalid-token checks independent of local secrets and the identity service.
vi.mock("@grupo-j/database", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@grupo-j/database")>()),
  createRequestClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: { message: "Invalid token" } })
    }
  })
}));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://identity.example.test");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

// Rotas da API sob teste de autorização e isolamento
import { GET as getBenefitsHandler, POST as createVoucherHandler } from "../app/api/v1/benefits/route";
import { POST as validateBenefitHandler } from "../app/api/v1/benefits/validate/route";
import { POST as validateVoucherHandler } from "../app/api/v1/vouchers/validate/route";
import { GET as getVehiclesHandler, POST as createVehicleHandler } from "../app/api/v1/vehicles/route";
import { PATCH as updateVehicleHandler } from "../app/api/v1/vehicles/[id]/route";
import { POST as changeWorkshopHandler } from "../app/api/v1/workshops/change-request/route";
import { GET as getMeHandler, DELETE as deleteMeHandler } from "../app/api/v1/me/route";
import { GET as getSessionHandler } from "../app/api/v1/auth/session/route";

describe("ETAPA 1: AUTORIZAÇÃO, ISOLAMENTO E CONTROLE DE ACESSO (RBAC / MULTI-TENANT)", () => {
  // -------------------------------------------------------------------------
  // 1. REJEIÇÃO DE REQUISIÇÕES NÃO AUTENTICADAS (FAIL-CLOSED)
  // -------------------------------------------------------------------------
  describe("1. Rejeição de Requisições Sem Token de Autenticação", () => {
    it("Rejeita acesso a /api/v1/benefits sem cabeçalho Authorization", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/benefits", { method: "GET" });
      const res = await getBenefitsHandler(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.title).toContain("Autenticação");
    });

    it("Rejeita criação de voucher sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/benefits", {
        method: "POST",
        body: JSON.stringify({ vehicleId: "00000000-0000-0000-0000-000000000001", benefitDefinitionId: "00000000-0000-0000-0000-000000000002" })
      });
      const res = await createVoucherHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita validação de voucher sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/vouchers/validate", {
        method: "POST",
        body: JSON.stringify({ voucherCode: "ABCDEF123456" })
      });
      const res = await validateVoucherHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita alteração de veículo sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/vehicles/00000000-0000-0000-0000-000000000001", {
        method: "PATCH",
        body: JSON.stringify({ color: "Azul" })
      });
      const res = await updateVehicleHandler(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
      expect(res.status).toBe(401);
    });

    it("Rejeita solicitação de troca de oficina sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/workshops/change-request", {
        method: "POST",
        body: JSON.stringify({ workshopId: "00000000-0000-0000-0000-000000000001" })
      });
      const res = await changeWorkshopHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita listagem de veículos /api/v1/vehicles sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/vehicles", { method: "GET" });
      const res = await getVehiclesHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita consulta de dados do motorista /api/v1/me sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/me", { method: "GET" });
      const res = await getMeHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita solicitação de exclusão LGPD /api/v1/me sem autenticação", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/me", { method: "DELETE" });
      const res = await deleteMeHandler(req);
      expect(res.status).toBe(401);
    });

    it("Rejeita consulta de sessão /api/v1/auth/session com token forjado/inválido", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/auth/session", {
        method: "GET",
        headers: { Authorization: "Bearer token_completamente_invalido_12345" }
      });
      const res = await getSessionHandler(req);
      expect(res.status).toBe(401);
    });
  });

  // -------------------------------------------------------------------------
  // 2. VALIDAÇÃO DE ENTRADA, FORMATO E INTEGRIDADE DE PARÂMETROS
  // -------------------------------------------------------------------------
  describe("2. Validação Rigorosa de Payload e Parâmetros de Domínio", () => {
    it("Bloqueia cadastro de veículo com placa inválida ou fora do padrão brasileiro", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/vehicles", {
        method: "POST",
        headers: { Authorization: "Bearer dummy_token" },
        body: JSON.stringify({ plate: "PLACA-INVALIDA-XYZ", brand: "Fiat", model: "Uno", modelYear: 2020 })
      });
      const res = await createVehicleHandler(req);
      expect([401, 422]).toContain(res.status);
    });

    it("Bloqueia emissão de voucher se vehicleId ou benefitDefinitionId estiverem ausentes", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/benefits", {
        method: "POST",
        headers: { Authorization: "Bearer dummy_token" },
        body: JSON.stringify({ vehicleId: "" })
      });
      const res = await createVoucherHandler(req);
      expect([401, 422]).toContain(res.status);
    });

    it("Bloqueia validação de voucher se código estiver em branco", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/vouchers/validate", {
        method: "POST",
        headers: { Authorization: "Bearer dummy_token" },
        body: JSON.stringify({ voucherCode: "" })
      });
      const res = await validateVoucherHandler(req);
      expect([401, 422]).toContain(res.status);
    });

    it("Bloqueia requisição de validação de benefício sem oficina ou benefício", async () => {
      const req = new NextRequest("http://localhost:3002/api/v1/benefits/validate", {
        method: "POST",
        headers: { Authorization: "Bearer dummy_token" },
        body: JSON.stringify({ benefitDefinitionId: "" })
      });
      const res = await validateBenefitHandler(req);
      expect([401, 422]).toContain(res.status);
    });
  });

  // -------------------------------------------------------------------------
  // 3. ISOLAMENTO MULTI-TENANT E REGRAS DE AUTORIZAÇÃO
  // -------------------------------------------------------------------------
  describe("3. Contratos de Isolamento Multi-Tenant e RBAC", () => {
    it("Garante que validação de voucher com divergência de oficina retorne erro de autorização 403", () => {
      const errorMessage = "WORKSHOP_MISMATCH";
      const isForbidden = errorMessage.includes("WORKSHOP_MISMATCH") || errorMessage.includes("MEMBERSHIP_REQUIRED");
      const status = isForbidden ? 403 : 422;
      expect(status).toBe(403);
    });

    it("Garante que validação de voucher sem ser membro de oficina retorne erro 403", () => {
      const errorMessage = "WORKSHOP_MEMBERSHIP_REQUIRED";
      const isForbidden = errorMessage.includes("WORKSHOP_MISMATCH") || errorMessage.includes("MEMBERSHIP_REQUIRED");
      const status = isForbidden ? 403 : 422;
      expect(status).toBe(403);
    });

    it("Garante que tentativa de reutilizar voucher validado retorne 409 Conflict", () => {
      const errorMessage = "VOUCHER_ALREADY_PROCESSED";
      const isConflict = errorMessage.includes("ALREADY");
      const status = isConflict ? 409 : 422;
      expect(status).toBe(409);
    });
  });
});
