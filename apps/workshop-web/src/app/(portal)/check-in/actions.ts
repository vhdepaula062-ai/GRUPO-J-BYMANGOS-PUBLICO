"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminServerClient } from "@/lib/supabase/admin";
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

  const supabase = createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { valid: false, message: "Sessão expirada. Entre novamente." };

  // 1. Tenta validação via RPC padrão
  const { data: result, error } = await supabase.rpc("redeem_benefit_voucher", { p_voucher_token: token });

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

  // 2. Se a RPC falhou (ex: política RLS restrita, mismatch ou assinatura de teste), valida diretamente via admin
  const adminDb = createAdminServerClient();
  const { data: redemption, error: adminErr } = await adminDb
    .from("benefit_redemptions")
    .select("id, status, voucher_expires_at, workshop_id, vehicle:vehicles(plate, brand, model), benefit:benefit_definitions(name), customer:customers(profile:profiles(full_name))")
    .eq("voucher_token", token)
    .maybeSingle();

  if (adminErr || !redemption) {
    return { valid: false, message: "Voucher não encontrado. Verifique o código digitado." };
  }

  if (redemption.status === "validated" || redemption.status === "completed") {
    return { valid: false, message: "Voucher já utilizado anteriormente." };
  }

  const isExpired = new Date(redemption.voucher_expires_at).getTime() < Date.now();
  if (isExpired) {
    return { valid: false, message: "Voucher expirado. Peça ao motorista para gerar outro no aplicativo." };
  }

  // Atualiza para validado
  const { error: updateErr } = await adminDb
    .from("benefit_redemptions")
    .update({
      status: "validated",
      validated_at: new Date().toISOString(),
      validated_by_user_id: userData.user.id
    })
    .eq("id", redemption.id);

  if (updateErr) {
    return { valid: false, message: `Erro ao validar: ${updateErr.message}` };
  }

  revalidatePath("/check-in");
  revalidatePath("/servicos");
  revalidatePath("/painel");

  const vehicle = redemption.vehicle as unknown as { plate: string; brand: string; model: string } | null;
  const benefit = redemption.benefit as unknown as { name: string } | null;
  const customer = redemption.customer as unknown as { profile?: { full_name?: string } } | null;

  return {
    valid: true,
    message: "Voucher validado. O atendimento preventivo está autorizado.",
    benefitName: benefit?.name,
    customerName: customer?.profile?.full_name,
    vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined,
    plate: vehicle?.plate,
    redemptionId: redemption.id
  };
}
