import { Entitlement, BenefitDefinition, SubscriptionStatus } from "@grupo-j/types";
import {
  SubscriptionInactiveError,
  BenefitBalanceExhaustedError,
  BenefitGracePeriodError,
  DomainError
} from "./errors";

export interface RedemptionValidationParams {
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedAt: string;
  entitlement: Entitlement;
  benefitDefinition: BenefitDefinition;
  assignedWorkshopId: string;
  redemptionWorkshopId: string;
  now?: Date;
}

export class BenefitRedemptionValidator {
  public static validate(params: RedemptionValidationParams): void {
    const currentTime = params.now ?? new Date();

    // 1. Validar status da assinatura
    if (params.subscriptionStatus !== "active") {
      throw new SubscriptionInactiveError(params.subscriptionStatus);
    }

    // 2. Validar vínculo da oficina
    if (params.assignedWorkshopId !== params.redemptionWorkshopId) {
      throw new DomainError(
        "O cliente não está vinculado a esta oficina parceira para resgate de benefícios.",
        "WORKSHOP_MISMATCH",
        403
      );
    }

    // 3. Validar saldo disponível
    if (params.entitlement.availableQuantity <= 0) {
      throw new BenefitBalanceExhaustedError(params.benefitDefinition.name);
    }

    // 4. Validar carência (grace period)
    if (params.benefitDefinition.gracePeriodDays > 0) {
      const subDate = new Date(params.subscriptionStartedAt);
      const elapsedDays = Math.floor(
        (currentTime.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (elapsedDays < params.benefitDefinition.gracePeriodDays) {
        throw new BenefitGracePeriodError(
          params.benefitDefinition.gracePeriodDays,
          elapsedDays
        );
      }
    }
  }
}
