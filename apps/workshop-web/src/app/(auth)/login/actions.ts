"use server";
import { revalidatePath } from "next/cache";
import { persistWorkshopRegistration } from "@/lib/workshop-registration";

export interface RegisterWorkshopPartnerParams { tradeName: string; cnpj: string; contactName: string; phone: string; email: string; password?: string; city?: string; state?: string; }
export interface RegisterWorkshopPartnerResult { success: boolean; message: string; workshop?: { id: string; trade_name: string; cnpj_masked: string; status: string; email: string; phone: string; responsible_name?: string } }

export async function registerWorkshopPartnerAction(params: RegisterWorkshopPartnerParams): Promise<RegisterWorkshopPartnerResult> {
  try {
    if (!params.password) throw new Error("Senha obrigatória");
    const workshop = await persistWorkshopRegistration({ tradeName: params.tradeName, cnpj: params.cnpj, responsibleName: params.contactName, phone: params.phone, email: params.email, password: params.password, city: params.city, state: params.state });
    revalidatePath("/oficinas"); revalidatePath("/dashboard"); revalidatePath("/painel");
    return { success: true, message: "Cadastro recebido. Confirme o e-mail e aguarde a aprovação administrativa.", workshop };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Cadastro não concluído." };
  }
}
