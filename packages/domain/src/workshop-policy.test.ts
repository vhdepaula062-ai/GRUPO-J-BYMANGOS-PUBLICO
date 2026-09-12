import { describe, it, expect } from "vitest";
import { WorkshopChangePolicy } from "./workshop-policy";
import { WorkshopChangeCooldownError } from "./errors";

describe("WorkshopChangePolicy", () => {
  it("deve permitir escolha inicial quando não houver oficina vinculada", () => {
    expect(() => {
      WorkshopChangePolicy.assertCanChangeWorkshop({}, new Date());
    }).not.toThrow();
  });

  it("deve calcular a próxima data de troca para exatamente 30 dias após", () => {
    const assignedAt = new Date("2026-01-01T10:00:00.000Z");
    const nextAllowed = WorkshopChangePolicy.calculateNextAllowedDate(assignedAt);
    
    // 30 dias após 1 de janeiro é 31 de janeiro
    expect(nextAllowed.toISOString()).toBe("2026-01-31T10:00:00.000Z");
  });

  it("deve lançar WorkshopChangeCooldownError se a troca for tentada antes de 30 dias", () => {
    const state = {
      assignedWorkshopId: "workshop-123",
      assignedAt: "2026-01-01T10:00:00.000Z",
      nextChangeAllowedAt: "2026-01-31T10:00:00.000Z"
    };

    // Tentativa no 15º dia
    const currentTime = new Date("2026-01-16T10:00:00.000Z");

    expect(() => {
      WorkshopChangePolicy.assertCanChangeWorkshop(state, currentTime);
    }).toThrow(WorkshopChangeCooldownError);
  });

  it("deve permitir troca quando o prazo de 30 dias tiver expirado", () => {
    const state = {
      assignedWorkshopId: "workshop-123",
      assignedAt: "2026-01-01T10:00:00.000Z",
      nextChangeAllowedAt: "2026-01-31T10:00:00.000Z"
    };

    // Tentativa exatamente no 30º dia ou depois
    const currentTime = new Date("2026-01-31T10:00:01.000Z");

    expect(() => {
      WorkshopChangePolicy.assertCanChangeWorkshop(state, currentTime);
    }).not.toThrow();
  });
});
