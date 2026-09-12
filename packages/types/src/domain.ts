import {
  UserRole,
  SubscriptionStatus,
  PaymentStatus,
  BenefitPeriodicity,
  RedemptionStatus,
  PromotionStatus,
  PlanAudience,
  DiscountType
} from "./enums";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cpfMasked?: string;
  roles: UserRole[];
  organizationId?: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  legalName: string;
  tradeName: string;
  cnpjMasked: string;
  status: "active" | "suspended" | "pending_approval";
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopProfile {
  id: string;
  organizationId: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  latitude?: number;
  longitude?: number;
  ratingAverage: number;
  ratingCount: number;
  isOpenNow: boolean;
  operatingHours: Record<string, { open: string; close: string }>;
}

export interface Customer {
  id: string;
  profileId: string;
  fullName: string;
  email: string;
  phone: string;
  cpfMasked: string;
  assignedWorkshopId?: string;
  workshopAssignedAt?: string;
  nextWorkshopChangeAllowedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  modelYear: number;
  manufactureYear: number;
  color: string;
  renavamMasked?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  audience: PlanAudience;
  priceCents: number;
  currency: "BRL";
  billingIntervalMonths: number;
  isActive: boolean;
  version: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  planId: string;
  customerId?: string;
  organizationId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  gatewaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  periodicity: BenefitPeriodicity;
  quantityPerCycle: number;
  gracePeriodDays: number;
  isIncludedInBasePlan: boolean;
  isActive: boolean;
}

export interface Entitlement {
  id: string;
  customerId: string;
  benefitDefinitionId: string;
  cycleStart: string;
  cycleEnd: string;
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
}

export interface BenefitRedemption {
  id: string;
  customerId: string;
  vehicleId: string;
  workshopId: string;
  benefitDefinitionId: string;
  status: RedemptionStatus;
  voucherToken: string;
  voucherExpiresAt: string;
  validatedAt?: string;
  validatedByUserId?: string;
  evidencePhotoUrls: string[];
  notes?: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  workshopId: string;
  title: string;
  description: string;
  discountPercentage?: number;
  priceCents?: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  moderatedByUserId?: string;
  moderationNotes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amountCents: number;
  currency: "BRL";
  status: PaymentStatus;
  paymentMethodType: string;
  paidAt?: string;
  createdAt: string;
}

export interface DiscountWaiver {
  id: string;
  subscriptionId?: string;
  customerId?: string;
  organizationId?: string;
  type: DiscountType;
  value: number;
  reason: string;
  grantedByUserId: string;
  validFrom: string;
  validUntil?: string;
  isReverted: boolean;
  revertedAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId?: string;
  actorIp?: string;
  actorUserAgent?: string;
  entityName: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}
