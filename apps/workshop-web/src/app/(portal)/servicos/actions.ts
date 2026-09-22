"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { serviceTransitionSchema } from "@grupo-j/validation";
import { revalidatePath } from "next/cache";
export async function advanceService(form:FormData){
 const p=serviceTransitionSchema.parse({id:form.get("id"),status:form.get("status"),notes:form.get("notes"),odometer:form.get("odometer")?Number(form.get("odometer")):null});
 const db=await createServerSupabaseClient();const {error}=await db.rpc("advance_service_order",{p_id:p.id,p_status:p.status,p_notes:p.notes,p_odometer:p.odometer});
 if(error)throw new Error("Não foi possível atualizar. Confira sua permissão, o estado atual e a quilometragem.");
 for(const path of ['/servicos','/painel','/relatorios'])revalidatePath(path);
 return {message:"Atendimento atualizado. O motorista já pode consultar o histórico."};
}
