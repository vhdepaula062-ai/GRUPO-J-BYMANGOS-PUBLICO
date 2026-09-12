import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().uuid("ID de plano inválido"),
  paymentMethodToken: z.string().min(5, "Token de meio de pagamento obrigatório"),
  billingAddress: z.object({
    zipCode: z.string().min(8).max(9),
    street: z.string().min(2),
    number: z.string().min(1),
    city: z.string().min(2),
    state: z.string().length(2)
  }).optional()
});

export const grantWaiverDiscountSchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  type: z.enum(["percentage", "fixed_cents", "trial_cycles"]),
  value: z.number().int().positive("Valor deve ser inteiro positivo"),
  reason: z.string().min(10, "Justificativa obrigatória (mínimo 10 caracteres)"),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional()
});

export const redeemBenefitSchema = z.object({
  voucherToken: z.string().min(8, "Token do voucher inválido"),
  vehiclePlate: z.string().min(7).max(8),
  odometerKm: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
  evidencePhotoUrls: z.array(z.string().url()).min(1, "Ao menos uma foto de evidência é obrigatória")
});
