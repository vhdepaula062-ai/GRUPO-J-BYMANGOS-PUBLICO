import { describe, it, expect } from "vitest";
import {
  isSafeRedirectPath,
  isSafeHttpUrl,
  isSafeImageUrl,
  safeImageUrl,
  sanitizePlainText
} from "./security.schema";

describe("Segurança XSS e Validação de URLs (@grupo-j/validation)", () => {
  describe("isSafeRedirectPath", () => {
    it("permite caminhos relativos internos seguros", () => {
      expect(isSafeRedirectPath("/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("/painel?tab=servicos")).toBe("/painel?tab=servicos");
      expect(isSafeRedirectPath("/check-in#cliente-123")).toBe("/check-in#cliente-123");
    });

    it("rejeita e substitui tentativas de Open Redirect", () => {
      expect(isSafeRedirectPath("//evil.com", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("/\\evil.com", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("https://attacker.com", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("javascript:alert(1)", "/dashboard")).toBe("/dashboard");
      expect(isSafeRedirectPath("/dashboard\r\nSet-Cookie: evil=1", "/dashboard")).toBe("/dashboard");
    });

    it("utiliza o fallback padrão se o valor for nulo ou inválido", () => {
      expect(isSafeRedirectPath("", "/fallback")).toBe("/fallback");
      expect(isSafeRedirectPath(null, "/fallback")).toBe("/fallback");
      expect(isSafeRedirectPath(undefined, "/fallback")).toBe("/fallback");
    });
  });

  describe("isSafeHttpUrl", () => {
    it("permite URLs HTTP e HTTPS válidas", () => {
      expect(isSafeHttpUrl("https://grupoj.com.br")).toBe(true);
      expect(isSafeHttpUrl("http://localhost:3000/api/v1/health")).toBe(true);
      expect(isSafeHttpUrl("https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98")).toBe(true);
    });

    it("bloqueia esquemas perigosos (javascript, data, vbscript, file)", () => {
      expect(isSafeHttpUrl("javascript:alert(document.cookie)")).toBe(false);
      expect(isSafeHttpUrl("JaVaScRiPt:alert(1)")).toBe(false);
      expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
      expect(isSafeHttpUrl("vbscript:msgbox(1)")).toBe(false);
      expect(isSafeHttpUrl("file:///etc/passwd")).toBe(false);
      expect(isSafeHttpUrl("blob:https://evil.com/uuid")).toBe(false);
    });
  });

  describe("isSafeImageUrl & safeImageUrl", () => {
    it("permite URLs HTTPS e data URIs raster legítimas", () => {
      expect(isSafeImageUrl("https://grupoj.com.br/assets/logo.png")).toBe(true);
      expect(isSafeImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")).toBe(true);
      expect(isSafeImageUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
      expect(isSafeImageUrl("data:image/webp;base64,UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAQAA")).toBe(true);
    });

    it("bloqueia SVG em data URIs devido ao risco de scripts inline em tags <svg>", () => {
      expect(isSafeImageUrl("data:image/svg+xml;utf8,<svg onload=alert(1)>")).toBe(false);
      expect(isSafeImageUrl("data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+")).toBe(false);
    });

    it("bloqueia payloads javascript e HTML em imagens", () => {
      expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeImageUrl("<img src=x onerror=alert(1)>")).toBe(false);
      expect(safeImageUrl("javascript:alert(1)")).toBeNull();
      expect(safeImageUrl("https://grupoj.com.br/img.jpg")).toBe("https://grupoj.com.br/img.jpg");
    });
  });

  describe("sanitizePlainText", () => {
    it("remove caracteres de controle e bytes nulos preservando texto legítimo", () => {
      const malicious = "Oficina Central\x00 com revisão\x08 de freios";
      expect(sanitizePlainText(malicious)).toBe("Oficina Central com revisão de freios");
    });

    it("preserva caracteres acentuados, pontuação e espaçamento legítimo", () => {
      const legit = "Oficina Mecânica & Auto Elétrica São José — Promoção 20% OFF!";
      expect(sanitizePlainText(legit)).toBe(legit);
    });
  });
});
