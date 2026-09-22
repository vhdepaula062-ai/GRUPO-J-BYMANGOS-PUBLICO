"use server";
import {createAuthorizedAdminClient} from "@/lib/supabase/authorized";
import {createServerSupabaseClient,assertRecentAuthentication} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";
import {z} from "@grupo-j/validation";
export async function manageAdmin(form:FormData){
 await createAuthorizedAdminClient();const recent=await assertRecentAuthentication();if(!recent.success)throw new Error(recent.error);
 const email=z.string().email().parse(form.get("email"));const enabled=z.enum(["true","false"]).parse(form.get("enabled"));
 const db=await createServerSupabaseClient();const {error}=await db.rpc("manage_platform_admin",{p_email:email,p_enabled:enabled==="true"});
 if(error)throw new Error("Somente o proprietário pode alterar o acesso de outra conta existente. O próprio acesso e outros proprietários são protegidos.");
 revalidatePath("/usuarios");return {message:"Acesso administrativo atualizado."};
}
