"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { portalReplySchema } from "@grupo-j/validation";
import { revalidatePath } from "next/cache";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";

export async function replyRequest(form:FormData){
 const db=await createServerSupabaseClient();await createAuthorizedAdminClient();
 const p=portalReplySchema.parse({id:form.get("id"),body:form.get("body"),status:form.get("status")});
 const {error}=await db.rpc("reply_portal_request",{p_id:p.id,p_body:p.body,p_status:p.status??null});if(error)throw new Error("Resposta não registrada. Confira o acesso ao protocolo.");
 revalidatePath("/atendimento");return {message:"Resposta registrada."};
}
