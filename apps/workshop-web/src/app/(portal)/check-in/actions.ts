"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ValidateVoucherResult { valid: boolean; message: string; benefitName?: string; customerName?: string; vehicleModel?: string; plate?: string; redemptionId?: string; }

export async function validateVoucherAction(params: { voucherToken?: string; plate?: string; odometer?: string }): Promise<ValidateVoucherResult> {
  const token = params.voucherToken?.trim().toUpperCase();
  if (!token) return { valid: false, message: "Informe o código do voucher emitido pelo aplicativo." };
  const supabase = createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { valid: false, message: "Sessão expirada. Entre novamente." };

  const { data: result, error } = await supabase.rpc("redeem_benefit_voucher", { p_voucher_token: token });
  if (error) {
    const messages: Record<string, string> = {
      VOUCHER_NOT_FOUND: "Voucher não encontrado.", VOUCHER_EXPIRED: "Voucher expirado. Peça ao motorista para gerar outro.",
      VOUCHER_ALREADY_PROCESSED: "Voucher já utilizado.", WORKSHOP_MISMATCH: "O voucher pertence a outra oficina vinculada.",
      SUBSCRIPTION_INACTIVE: "A assinatura do motorista não está ativa.", BENEFIT_BALANCE_EXHAUSTED: "O saldo deste benefício terminou."
    };
    const key = Object.keys(messages).find((item) => error.message.includes(item));
    return { valid: false, message: key ? messages[key]! : "Não foi possível validar o voucher." };
  }

  const redemptionId = (result as { redemptionId?: string })?.redemptionId;
  const { data: redemption } = await supabase.from("benefit_redemptions").select("id, vehicle:vehicles(plate, brand, model), benefit:benefit_definitions(name), customer:customers(profile:profiles(full_name))").eq("id", redemptionId).single();
  revalidatePath("/check-in"); revalidatePath("/servicos"); revalidatePath("/painel");
  const vehicle = redemption?.vehicle as unknown as { plate: string; brand: string; model: string } | null;
  const benefit = redemption?.benefit as unknown as { name: string } | null;
  const customer = redemption?.customer as unknown as { profile?: { full_name?: string } } | null;
  return { valid: true, message: "Voucher validado. O atendimento preventivo está autorizado.", benefitName: benefit?.name, customerName: customer?.profile?.full_name, vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined, plate: vehicle?.plate, redemptionId };
}
