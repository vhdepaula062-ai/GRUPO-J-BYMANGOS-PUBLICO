"use server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {getMyWorkshop} from "@/lib/queries";
import {createAuthorizedWorkshopClient} from "@/lib/supabase/authorized";
import {revalidatePath} from "next/cache";
import {z} from "@grupo-j/validation";
export async function manageMember(form:FormData){
 const w=await getMyWorkshop(); const id=w?.organization?.id as string|undefined;
 if(!id||!["owner","manager"].includes(w?.role??""))throw new Error("Gestor autorizado necessário.");
 await createAuthorizedWorkshopClient(id,true);
 const p=z.object({email:z.string().email(),role:z.enum(["owner","manager","attendant","finance"]),active:z.boolean()}).parse({email:form.get("email"),role:form.get("role"),active:form.get("active")==="true"});
 const db=await createServerSupabaseClient();const {error}=await db.rpc("manage_workshop_member",{p_org:id,p_email:p.email,p_role:p.role,p_active:p.active});
 if(error)throw new Error("Não foi possível alterar o acesso. Confirme que a conta existe e que sua função permite essa alteração.");
 revalidatePath("/equipe");return {message:"Acesso atualizado."};
}
