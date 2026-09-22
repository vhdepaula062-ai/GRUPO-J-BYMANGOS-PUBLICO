"use server";
import { settingsSchema } from "@grupo-j/validation";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function saveSettings(form:FormData){
 await createAuthorizedAdminClient();const db=await createServerSupabaseClient();
 const value=settingsSchema.parse({controllerName:form.get("controllerName"),controllerDocument:form.get("controllerDocument"),privacyEmail:form.get("privacyEmail"),supportEmail:form.get("supportEmail"),privacyText:form.get("privacyText"),termsText:form.get("termsText"),legalPublished:form.get("legalPublished")==="on"});
 const {error}=await db.rpc("save_ecosystem_settings",{p_value:value,p_expected_version:Number(form.get("version"))});
 if(error)throw new Error(error.message.includes("VERSION_CONFLICT")?"Outra pessoa alterou a configuração. Atualize a página antes de salvar.":"Confira os dados. A publicação dos documentos exige identificação e textos completos.");
 revalidatePath("/configuracoes");return {message:"Configuração publicada com histórico de versão."};
}
export async function restoreSettings(form:FormData){
 const admin=await createAuthorizedAdminClient();const db=await createServerSupabaseClient();
 const {data,error}=await admin.from("configuration_revisions").select("value").eq("id",String(form.get("revision"))).single();
 if(error)throw new Error("Versão não encontrada.");
 const result=await db.rpc("save_ecosystem_settings",{p_value:data.value,p_expected_version:Number(form.get("version"))});if(result.error)throw new Error("Não foi possível restaurar. Atualize a página e confira a versão atual.");
 revalidatePath("/configuracoes");return {message:"Versão anterior restaurada em uma nova revisão."};
}
