import { describe, it, expect } from "vitest";
import { CpfSecurity } from "./cpf";
import { DataSanitizer } from "./sanitizer";

describe("CpfSecurity", () => {
  const dummyKeyHex = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const dummyPepper = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";

  it("recusa chaves de exemplo, ausentes e reutilizadas", () => {
    expect(() => CpfSecurity.assertProtectionKeys(dummyKeyHex, dummyPepper)).toThrow();
    expect(() => CpfSecurity.assertProtectionKeys(undefined, dummyPepper)).toThrow();
    const key = "893ac36d1f1efa22bf718e2099dd94f661ad3f2b9144c236e30c49c90af00f6a";
    expect(() => CpfSecurity.assertProtectionKeys(key, key)).toThrow();
  });

  it("aceita segredos independentes com tamanho correto", () => {
    expect(() => CpfSecurity.assertProtectionKeys(
      "893ac36d1f1efa22bf718e2099dd94f661ad3f2b9144c236e30c49c90af00f6a",
      "fdbf11dcd26bcc7e936023ce8e222869d46f198aa706567d63988201e9c45b71"
    )).not.toThrow();
  });

  it("deve mascarar CPF adequadamente para exibição", () => {
    expect(CpfSecurity.mask("123.456.789-00")).toBe("***.456.789-**");
    expect(CpfSecurity.mask("12345678900")).toBe("***.456.789-**");
  });

  it("deve gerar Blind Index determinístico para busca sem expor o CPF", () => {
    const blind1 = CpfSecurity.computeBlindIndex("123.456.789-00", dummyPepper);
    const blind2 = CpfSecurity.computeBlindIndex("12345678900", dummyPepper);
    expect(blind1).toBe(blind2);
    expect(blind1).toHaveLength(64); // SHA-256 hex
  });

  it("deve criptografar e descriptografar CPF com AES-256-GCM com perfeição", () => {
    const rawCpf = "12345678900";
    const encrypted = CpfSecurity.encrypt(rawCpf, dummyKeyHex);
    expect(encrypted).not.toContain(rawCpf);

    const decrypted = CpfSecurity.decrypt(encrypted, dummyKeyHex);
    expect(decrypted).toBe(rawCpf);
  });
});

describe("DataSanitizer", () => {
  it("deve ofuscar chaves sensíveis como password e token", () => {
    const payload = {
      email: "motorista@teste.com",
      password: "SenhaSuperSecreta123!",
      token: "jwt-token-aqui"
    };

    const sanitized = DataSanitizer.sanitizeObject(payload);
    expect(sanitized.password).toBe("[REDACTED_SECRET]");
    expect(sanitized.token).toBe("[REDACTED_SECRET]");
    expect(sanitized.email).toBe("[REDACTED_SECRET]");
  });
});
