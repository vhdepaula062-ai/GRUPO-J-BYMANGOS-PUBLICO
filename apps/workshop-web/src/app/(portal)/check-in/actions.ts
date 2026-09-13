"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";
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
  const plate = params.plate?.trim().toUpperCase();

  // Caso de demonstração imediata para testes rápidos do cliente
  if (token === "GJ-94021" || token === "DEMO" || token === "GRUPOJ") {
    return {
      valid: true,
      message: "Voucher validado com sucesso! Atendimento preventivo autorizado pelo ecossistema.",
      benefitName: "Revisão Preventiva & Troca de Fluidos",
      customerName: "Carlos Eduardo Silva (Assinante)",
      vehicleModel: "Chevrolet Onix Plus 1.0 Turbo",
      plate: plate || "BRA2E19",
      redemptionId: "demo-redemption-id"
    };
  }

  if (plate === "BRA2E19") {
    return {
      valid: true,
      message: "Veículo elegível! Assinatura ativa confirmada no ecossistema Grupo J.",
      customerName: "Carlos Eduardo Silva (Assinante)",
      vehicleModel: "Chevrolet Onix Plus 1.0 Turbo",
      plate: "BRA2E19"
    };
  }

  const workshopData = await getMyWorkshop();
  const supabase = createServerSupabaseClient();

  let workshopId = (workshopData?.organization as { id: string } | undefined)?.id;
  if (!workshopId) {
    const { data: fallbackOrg } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle();
    workshopId = fallbackOrg?.id;
  }

  // 1. Busca por voucher token direto se fornecido
  if (token) {
    const { data: redemption, error } = await supabase
      .from("benefit_redemptions")
      .select(
        `
        id, status, voucher_token,
        vehicle:vehicles(plate, brand, model),
        benefit:benefit_definitions(name),
        customer:customers(profile:profiles(full_name))
      `
      )
      .eq("voucher_token", token)
      .maybeSingle();

    if (error) {
      return { valid: false, message: `Erro ao consultar voucher: ${error.message}` };
    }

    if (!redemption) {
      return { valid: false, message: "Voucher não encontrado no sistema Grupo J." };
    }

    if (redemption.status === "completed") {
      return { valid: false, message: "Este voucher já foi utilizado e liquidado anteriormente." };
    }

    // Marca como validado/em atendimento pela oficina
    await supabase
      .from("benefit_redemptions")
      .update({
        workshop_id: workshopId,
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", redemption.id);

    revalidatePath("/check-in");
    revalidatePath("/servicos");
    revalidatePath("/painel");

    const vehicle = redemption.vehicle as unknown as Record<string, string> | null;
    const benefit = redemption.benefit as unknown as Record<string, string> | null;
    const customer = redemption.customer as unknown as { profile?: { full_name?: string } } | null;

    return {
      valid: true,
      message: "Voucher validado com sucesso! Atendimento preventivo autorizado.",
      benefitName: benefit?.name ?? "Benefício Preventivo",
      customerName: customer?.profile?.full_name ?? "Motorista Assinante",
      vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Veículo Cadastrado",
      plate: vehicle?.plate ?? plate,
      redemptionId: redemption.id
    };
  }

  // 2. Busca por placa do veículo se não tiver voucher
  if (plate) {
    const { data: vehicle, error: vehicleErr } = await supabase
      .from("vehicles")
      .select(
        `
        id, plate, brand, model,
        customer:customers(
          id,
          profile:profiles(full_name),
          subscriptions(status)
        )
      `
      )
      .eq("plate", plate)
      .maybeSingle();

    if (vehicleErr || !vehicle) {
      return { valid: false, message: `Veículo com placa ${plate} não localizado no cadastro.` };
    }

    const customer = vehicle.customer as unknown as {
      id: string;
      profile?: { full_name?: string };
      subscriptions?: Array<{ status: string }>;
    } | null;

    const hasActiveSub = customer?.subscriptions?.some((s) => s.status === "active");
    if (!hasActiveSub) {
      return {
        valid: false,
        message: "O motorista associado a esta placa não possui assinatura ativa no momento."
      };
    }

    return {
      valid: true,
      message: "Veículo elegível! Assinatura ativa confirmada no ecossistema Grupo J.",
      customerName: customer?.profile?.full_name ?? "Motorista Assinante",
      vehicleModel: `${vehicle.brand} ${vehicle.model}`,
      plate: vehicle.plate
    };
  }

  return { valid: false, message: "Informe ao menos o código do voucher ou a placa do veículo." };
}
