"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ValidateVoucherResult {
  valid: boolean;
  message: string;
  benefitName?: string;
  customerName?: string;
  vehicleModel?: string;
  plate?: string;
  redemptionId?: string;
}

export async function validateVoucherAction(params: {
  voucherToken?: string;
  plate?: string;
  odometer?: string;
}): Promise<ValidateVoucherResult> {
  const token = params.voucherToken?.trim().toUpperCase();
  if (!token) return { valid: false, message: "Informe o código do voucher emitido pelo aplicativo." };

  const odometer=params.odometer?.trim()?Number(params.odometer):null;
  if(odometer!==null&&(!Number.isInteger(odometer)||odometer<0||odometer>10000000))return {valid:false,message:"Quilometragem inválida."};
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { valid: false, message: "Sessão expirada. Entre novamente." };

  // 1. Tenta validação via RPC padrão
  const { data: result, error } = await supabase.rpc("check_in_voucher", { p_token: token,p_plate:params.plate??null,p_odometer:odometer });

  if (!error && result) {
    const redemptionId = (result as { redemptionId?: string })?.redemptionId;
    const { data: redemption } = await supabase
      .from("benefit_redemptions")
      .select("id, vehicle:vehicles(plate, brand, model), benefit:benefit_definitions(name), customer:customers(profile:profiles(full_name))")
      .eq("id", redemptionId)
      .single();

    revalidatePath("/check-in");
    revalidatePath("/servicos");
    revalidatePath("/painel");

    const vehicle = redemption?.vehicle as unknown as { plate: string; brand: string; model: string } | null;
    const benefit = redemption?.benefit as unknown as { name: string } | null;
    const customer = redemption?.customer as unknown as { profile?: { full_name?: string } } | null;

    return {
      valid: true,
      message: "Voucher validado. O atendimento preventivo está autorizado.",
      benefitName: benefit?.name,
      customerName: customer?.profile?.full_name,
      vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
      plate: vehicle?.plate,
      redemptionId
    };
  }

  return { valid: false, message: "Não foi possível autorizar o voucher. Confira a oficina vinculada, a vigência da assinatura, a validade do código e o saldo do benefício." };
}
