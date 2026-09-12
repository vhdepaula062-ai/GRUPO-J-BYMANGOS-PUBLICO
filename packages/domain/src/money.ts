import { InvalidMonetaryAmountError } from "./errors";

export class MonetaryAmount {
  public readonly cents: number;
  public readonly currency: "BRL" = "BRL";

  constructor(cents: number) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new InvalidMonetaryAmountError(cents);
    }
    this.cents = cents;
  }

  public static fromCents(cents: number): MonetaryAmount {
    return new MonetaryAmount(cents);
  }

  public static fromReais(reais: number): MonetaryAmount {
    return new MonetaryAmount(Math.round(reais * 100));
  }

  public toReais(): number {
    return this.cents / 100;
  }

  public format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(this.toReais());
  }

  public add(other: MonetaryAmount): MonetaryAmount {
    return new MonetaryAmount(this.cents + other.cents);
  }

  public subtract(other: MonetaryAmount): MonetaryAmount {
    if (this.cents < other.cents) {
      throw new InvalidMonetaryAmountError(this.cents - other.cents);
    }
    return new MonetaryAmount(this.cents - other.cents);
  }
}
