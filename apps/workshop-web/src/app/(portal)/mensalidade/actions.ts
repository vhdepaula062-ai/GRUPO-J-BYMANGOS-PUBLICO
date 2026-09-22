"use server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";
import {z} from "@grupo-j/validation";
export async function cancelSubscription(form:FormData){const id=z.string().uuid().parse(form.get("id"));const db=await createServerSupabaseClient();const {error}=await db.rpc("cancel_own_subscription",{p_id:id});if(error)throw new Error("Cancelamento indisponível. Confirme seu acesso de proprietário ou gerente.");revalidatePath("/mensalidade");return {message:"Renovação desativada. A vigência atual permanece até a data informada."};}
