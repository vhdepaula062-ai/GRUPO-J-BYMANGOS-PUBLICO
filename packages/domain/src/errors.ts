export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WorkshopChangeCooldownError extends DomainError {
  public readonly nextChangeAllowedAt: string;

  constructor(nextChangeAllowedAt: string) {
    super(
      `A troca de oficina parceira só é permitida após 30 dias da última vinculação. Próxima data permitida: ${nextChangeAllowedAt}`,
      "WORKSHOP_CHANGE_COOLDOWN",
      422
    );
    this.nextChangeAllowedAt = nextChangeAllowedAt;
  }
}

export class InvalidMonetaryAmountError extends DomainError {
  constructor(amount: number) {
    super(
      `Valor monetário inválido: ${amount}. Valores devem ser números inteiros maiores que zero representando centavos.`,
      "INVALID_MONETARY_AMOUNT",
      422
    );
  }
}

export class SubscriptionInactiveError extends DomainError {
  constructor(status: string) {
    super(
      `A assinatura do motorista não está ativa (status atual: ${status}). Apenas assinaturas com status 'active' podem resgatar benefícios.`,
      "SUBSCRIPTION_INACTIVE",
      403
    );
  }
}

export class BenefitBalanceExhaustedError extends DomainError {
  constructor(benefitName: string) {
    super(
      `O saldo do benefício '${benefitName}' para o ciclo vigente foi totalmente utilizado.`,
      "BENEFIT_BALANCE_EXHAUSTED",
      422
    );
  }
}

export class BenefitGracePeriodError extends DomainError {
  constructor(gracePeriodDays: number, activeDays: number) {
    super(
      `Carência de benefício ativa. O plano exige ${gracePeriodDays} dias de carência (dias decorridos: ${activeDays}).`,
      "BENEFIT_GRACE_PERIOD_ACTIVE",
      422
    );
  }
}
