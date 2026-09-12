import { describe, it, expect } from "vitest";
import { MonetaryAmount } from "./money";
import { InvalidMonetaryAmountError } from "./errors";

describe("MonetaryAmount", () => {
  it("deve criar valor em centavos e formatar em Real (BRL)", () => {
    const driverPlanAmount = MonetaryAmount.fromCents(5000);
    expect(driverPlanAmount.cents).toBe(5000);
    expect(driverPlanAmount.toReais()).toBe(50.0);
    expect(driverPlanAmount.format()).toContain("50,00");

    const workshopPlanAmount = MonetaryAmount.fromCents(50000);
    expect(workshopPlanAmount.cents).toBe(50000);
    expect(workshopPlanAmount.toReais()).toBe(500.0);
    expect(workshopPlanAmount.format()).toContain("500,00");
  });

  it("deve rejeitar valores negativos ou não inteiros", () => {
    expect(() => MonetaryAmount.fromCents(-100)).toThrow(InvalidMonetaryAmountError);
    expect(() => MonetaryAmount.fromCents(50.5)).toThrow(InvalidMonetaryAmountError);
  });

  it("deve somar e subtrair centavos com exatidão sem erros de ponto flutuante", () => {
    const a = MonetaryAmount.fromCents(5000);
    const b = MonetaryAmount.fromCents(2500);
    expect(a.add(b).cents).toBe(7500);
    expect(a.subtract(b).cents).toBe(2500);
  });
});
