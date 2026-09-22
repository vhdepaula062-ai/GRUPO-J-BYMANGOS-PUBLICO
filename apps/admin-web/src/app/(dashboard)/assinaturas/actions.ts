"use server";
import {createAuthorizedAdminClient} from "@/lib/supabase/authorized";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import {revalidatePath} from "next/cache";
import {z} from "@grupo-j/validation";
export async function createPlan(form:FormData){
 await createAuthorizedAdminClient();const p=z.object({name:z.string().trim().min(3).max(100),audience:z.enum(["customer","workshop"]),price:z.coerce.number().int().min(1).max(100000000),months:z.coerce.number().int().min(1).max(12),benefits:z.array(z.string().uuid()).max(200)}).parse({name:form.get("name"),audience:form.get("audience"),price:Math.round(Number(form.get("price"))*100),months:form.get("months"),benefits:form.getAll("benefits")});
 const db=await createServerSupabaseClient();const {error}=await db.rpc("create_catalog_plan",{p_name:p.name,p_audience:p.audience,p_price:p.price,p_months:p.months,p_benefits:p.benefits});if(error)throw new Error("Plano não criado. Confira os benefícios e tente novamente.");revalidatePath("/assinaturas");return {message:"Nova oferta criada. Contratos existentes preservados."};
}
export async function grantTrial(form:FormData){
 const admin=await createAuthorizedAdminClient();const p=z.object({plan:z.string().uuid(),audience:z.enum(["customer","workshop"]),email:z.string().email(),days:z.coerce.number().int().min(1).max(365),reason:z.string().trim().min(10).max(1000),key:z.string().uuid()}).parse(Object.fromEntries(form));
 const subject=p.audience==="customer"?await admin.from("customers").select("id,profile:profiles!inner(email)").eq("profile.email",p.email).maybeSingle():await admin.from("organizations").select("id").eq("email",p.email).maybeSingle();
 if(subject.error||!subject.data)throw new Error("Cadastro não encontrado para este e-mail e público.");
 const db=await createServerSupabaseClient();const {error}=await db.rpc("grant_trial_subscription",{p_plan:p.plan,p_customer:p.audience==="customer"?subject.data.id:null,p_org:p.audience==="workshop"?subject.data.id:null,p_days:p.days,p_reason:p.reason,p_key:p.key});
 if(error)throw new Error("Período não concedido. Confira o plano, o público e a existência de assinatura vigente.");revalidatePath("/assinaturas");return {message:"Período gratuito concedido, sem registro de pagamento."};
}
