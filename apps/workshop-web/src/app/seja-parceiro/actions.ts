"use server";
import { revalidatePath } from "next/cache";
import { persistWorkshopRegistration, WorkshopRegistrationInputError } from "@/lib/workshop-registration";

export interface RegisterWorkshopParams { responsibleName: string; tradeName: string; legalName?: string; cnpj: string; phone: string; email: string; city: string; state: string; }
export interface RegisterWorkshopResult { success: boolean; message: string; organizationId?: string; }

export async function registerPartnerWorkshopAction(params: RegisterWorkshopParams): Promise<RegisterWorkshopResult> {
  try {
    const workshop = await persistWorkshopRegistration(params);
    revalidatePath("/oficinas"); revalidatePath("/dashboard");
    return { success: true, message: "Proposta enviada. A oficina aguardará a análise administrativa.", organizationId: workshop.id };
  } catch (error) {
    return { success: false, message: error instanceof WorkshopRegistrationInputError ? error.message : "Não foi possível enviar a proposta. Confira os dados ou tente novamente mais tarde." };
  }
}
