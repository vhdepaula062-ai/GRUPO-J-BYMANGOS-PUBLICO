import { describe, it, expect } from "vitest";
import { isValidCPF, cpfSchema } from "./cpf.schema";
import { plateSchema } from "./plate.schema";

describe("CPF Validation", () => {
  it("deve validar algoritmo de CPF corretamente", () => {
    // CPFs com todos os dígitos repetidos são inválidos
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);

    // Formato inválido
    expect(isValidCPF("12345")).toBe(false);
    expect(cpfSchema.safeParse("12345").success).toBe(false);
  });

  it("deve validar schema de placa Mercosul e tradicional", () => {
    expect(plateSchema.safeParse("BRA2E19").success).toBe(true);
    expect(plateSchema.safeParse("ABC-1234").success).toBe(true);
    expect(plateSchema.safeParse("ABC1234").success).toBe(true);
    expect(plateSchema.safeParse("INVALIDA").success).toBe(false);
  });
});
