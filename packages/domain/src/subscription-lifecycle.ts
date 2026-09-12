import { SubscriptionStatus } from "@grupo-j/types";
import { SubscriptionInactiveError } from "./errors";

export class SubscriptionLifecycle {
  private static readonly VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    pending: ["active", "failed", "canceled"],
    active: ["past_due", "paused", "canceled"],
    past_due: ["active", "canceled", "failed"],
    paused: ["active", "canceled"],
    canceled: [],
    failed: []
  };

  public static canTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  public static assertIsActive(status: SubscriptionStatus): void {
    if (status !== "active") {
      throw new SubscriptionInactiveError(status);
    }
  }

  public static isOperational(status: SubscriptionStatus): boolean {
    return status === "active";
  }
}
