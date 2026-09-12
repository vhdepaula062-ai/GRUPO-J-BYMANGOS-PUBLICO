import { WorkshopChangeCooldownError } from "./errors";

export interface WorkshopAssignmentState {
  assignedWorkshopId?: string;
  assignedAt?: string;
  nextChangeAllowedAt?: string;
}

export class WorkshopChangePolicy {
  public static readonly COOLDOWN_DAYS = 30;

  /**
   * Calcula a data a partir da qual uma nova troca é permitida.
   * Regra inegociável: exatamente 30 dias após a vinculação anterior.
   */
  public static calculateNextAllowedDate(assignedAt: Date): Date {
    const nextAllowed = new Date(assignedAt.getTime());
    nextAllowed.setDate(nextAllowed.getDate() + this.COOLDOWN_DAYS);
    return nextAllowed;
  }

  /**
   * Valida se o cliente pode realizar a troca para uma nova oficina na data atual.
   * Se ainda estiver no período de carência dos 30 dias, lança WorkshopChangeCooldownError.
   */
  public static assertCanChangeWorkshop(
    state: WorkshopAssignmentState,
    currentTime: Date = new Date()
  ): void {
    // Se ainda não possui oficina vinculada, pode escolher livremente
    if (!state.assignedWorkshopId || !state.nextChangeAllowedAt) {
      return;
    }

    const nextAllowedDate = new Date(state.nextChangeAllowedAt);
    if (currentTime < nextAllowedDate) {
      throw new WorkshopChangeCooldownError(nextAllowedDate.toISOString());
    }
  }

  /**
   * Retorna os dias restantes para liberação da troca de oficina.
   */
  public static getRemainingDays(
    state: WorkshopAssignmentState,
    currentTime: Date = new Date()
  ): number {
    if (!state.assignedWorkshopId || !state.nextChangeAllowedAt) {
      return 0;
    }

    const nextAllowed = new Date(state.nextChangeAllowedAt).getTime();
    const current = currentTime.getTime();

    if (current >= nextAllowed) {
      return 0;
    }

    const diffMs = nextAllowed - current;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
