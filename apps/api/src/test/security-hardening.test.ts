import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "../lib/rate-limiter";
import { isSafeRedirectPath, isSafeHttpUrl, isSafeImageUrl, sanitizePlainText } from "@grupo-j/validation";

describe("Auditoria e Hardening de Segurança (Etapa 9 - Testes de Regressão)", () => {
  describe("1. Rate Limiting e Prevenção de Abuso", () => {
    it("permite requisições dentro do limite configurado", () => {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
        headers: { "x-forwarded-for": "192.168.1.50" }
      });

      const res = checkRateLimit(req, {
        maxRequests: 3,
        windowMs: 10000,
        keyPrefix: "test-login"
      });

      expect(res).toBeNull();
    });

    it("bloqueia com HTTP 429 Too Many Requests ao exceder limite", () => {
      const ip = "10.0.0.99";
      const config = { maxRequests: 2, windowMs: 10000, keyPrefix: "test-bruteforce" };

      const makeReq = () =>
        new NextRequest("http://localhost:3000/api/v1/auth/login", {
          headers: { "x-forwarded-for": ip }
        });

      // Req 1 & 2 permitidas
      expect(checkRateLimit(makeReq(), config)).toBeNull();
      expect(checkRateLimit(makeReq(), config)).toBeNull();

      // Req 3 excede limite
      const blocked = checkRateLimit(makeReq(), config);
      expect(blocked).not.toBeNull();
      expect(blocked?.status).toBe(429);
      expect(blocked?.headers.get("Retry-After")).toBeDefined();
    });

    it("extrai IP corretamente prevenindo spoofing com múltiplos valores", () => {
      const req = new NextRequest("http://localhost:3000/api/v1/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" }
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });
  });

  describe("2. Validações de Redirecionamento e URLs", () => {
    it("bloqueia tentativas de Open Redirect", () => {
      expect(isSafeRedirectPath("//attacker.com", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("/\\attacker.com", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("https://phishing.com/login", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("javascript:alert(1)", "/dashboard")).toBe("/dashboard");
    });

    it("permite caminhos internos válidos da aplicação", () => {
      expect(isSafeRedirectPath("/painel", "/dashboard")).toBe("/painel");
      expect(isSafeRedirectPath("/check-in?tab=clientes", "/dashboard")).toBe("/check-in?tab=clientes");
    });

    it("bloqueia esquemas perigosos de imagem e vetores SVG com script", () => {
      expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeImageUrl("data:image/svg+xml;utf8,<svg onload=alert(1)>")).toBe(false);
      expect(isSafeImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")).toBe(true);
      expect(isSafeImageUrl("https://grupoj.com.br/assets/banner.webp")).toBe(true);
      expect(isSafeHttpUrl("https://grupoj.com.br")).toBe(true);
      expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    });
  });

  describe("3. Sanitização de Texto Legítimo (UTF-8)", () => {
    it("remove caracteres de controle invisíveis preservando acentos da língua portuguesa", () => {
      const input = "Auto Mecânica São José \x00— Troca de Óleo & Revisão Elétrica";
      expect(sanitizePlainText(input)).toBe("Auto Mecânica São José — Troca de Óleo & Revisão Elétrica");
    });
  });
});
