"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { portalRequestSchema,portalReplySchema } from "@grupo-j/validation";
import { revalidatePath } from "next/cache";

export async function openRequest(form:FormData){
 const db=await createServerSupabaseClient();const p=portalRequestSchema.parse({kind:form.get("kind"),subject:form.get("subject"),body:form.get("body")});
 const {error}=await db.rpc("open_portal_request",{p_kind:p.kind,p_subject:p.subject,p_body:p.body});if(error)throw new Error("Não foi possível abrir o protocolo. Confira os dados e tente novamente.");
 revalidatePath("/suporte");return {message:"Protocolo registrado. Acompanhe a resposta abaixo."};
}
export async function replyRequest(form:FormData){
 const db=await createServerSupabaseClient();const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user)throw new Error("Sessão inválida.");
 const p=portalReplySchema.parse({id:form.get("id"),body:form.get("body"),status:undefined});
 const {error}=await db.rpc("reply_portal_request",{p_id:p.id,p_body:p.body,p_status:p.status??null});if(error)throw new Error("Resposta não registrada. Confira o acesso ao protocolo.");
 revalidatePath("/suporte");return {message:"Resposta registrada."};
}
