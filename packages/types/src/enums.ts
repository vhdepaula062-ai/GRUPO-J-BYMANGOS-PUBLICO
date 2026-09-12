export type UserRole =
  | "platform_owner"
  | "platform_admin"
  | "finance_admin"
  | "support_admin"
  | "privacy_admin"
  | "auditor"
  | "workshop_owner"
  | "workshop_manager"
  | "workshop_attendant"
  | "workshop_finance"
  | "customer"
  | "mangos_support";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "failed";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded"
  | "charged_back";

export type BenefitPeriodicity =
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type RedemptionStatus =
  | "requested"
  | "validated"
  | "in_progress"
  | "completed"
  | "canceled"
  | "rejected";

export type PromotionStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "active"
  | "paused"
  | "rejected"
  | "expired";

export type PlanAudience = "customer" | "workshop";

export type DiscountType = "percentage" | "fixed_cents" | "trial_cycles";
