import { NextRequest } from "next/server";
import { CpfSecurity } from "@grupo-j/security";
import { authenticateRequest,isAuthFailure,getAdminDatabase,getPublicDatabase } from "@/lib/auth";
import { createProblemResponse,createSuccessResponse } from "@/lib/response";
import { checkRateLimit } from "@/lib/rate-limiter";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 const limited=await checkRateLimit(request,{keyPrefix:"data-export",maxRequests:5,windowMs:60000});if(limited)return limited;
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const body=await request.json().catch(()=>({}));
 if(typeof body.password!=="string"||!auth.user.email)return createProblemResponse({type:"about:blank",title:"Confirme sua senha",status:422});
 const verification=await getPublicDatabase().auth.signInWithPassword({email:auth.user.email,password:body.password});
 if(verification.error||verification.data.user?.id!==auth.user.id)return createProblemResponse({type:"about:blank",title:"Senha inválida",status:403});
 if(verification.data.session)await getAdminDatabase().auth.admin.signOut(verification.data.session.access_token,"local");
 try{
  const db=getAdminDatabase();
  const {data:profile,error}=await db.from("profiles").select("id,full_name,email,phone,cpf_masked,cpf_encrypted,created_at").eq("id",auth.user.id).single();
  if(error)throw error;
  const {cpf_encrypted,...visible}=profile;
  const cpf=cpf_encrypted?CpfSecurity.decrypt(cpf_encrypted,process.env.CPF_ENCRYPTION_KEY!):null;
  async function rows(table:string,filter:string,ids:string[]){
   if(!ids.length)return [];
   const result:unknown[]=[];
   for(let offset=0;;offset+=500){const {data,error}=await db.from(table).select("*").in(filter,ids).order("id").range(offset,offset+499);if(error)throw error;result.push(...data);if(data.length<500)return result;}
  }
  const customers=await rows("customers","profile_id",[auth.user.id]) as Array<{id:string}>;
  const customerIds=customers.map(x=>x.id);
  const subscriptions=await rows("subscriptions","customer_id",customerIds) as Array<{id:string}>;
  const requests=await rows("portal_requests","user_id",[auth.user.id]) as Array<{id:string}>;
  const exportData={generatedAt:new Date().toISOString(),profile:{...visible,cpf},customers,subscriptions,
   vehicles:await rows("vehicles","customer_id",customerIds),payments:await rows("payments","subscription_id",subscriptions.map(s=>s.id)),invoices:await rows("invoices","subscription_id",subscriptions.map(s=>s.id)),
   benefits:await rows("entitlements","customer_id",customerIds),redemptions:await rows("benefit_redemptions","customer_id",customerIds),services:await rows("service_orders","customer_id",customerIds),
   consents:await rows("consent_records","user_id",[auth.user.id]),erasureRequests:await rows("account_erasure_requests","user_id",[auth.user.id]),requests,messages:await rows("portal_request_messages","request_id",requests.map(r=>r.id)),notifications:await rows("user_notifications","user_id",[auth.user.id])};
  const audit=await db.from("audit_logs").insert({actor_user_id:auth.user.id,entity_name:"profiles",entity_id:auth.user.id,action:"subject_export",reason:"Exportação autenticada pelo próprio titular"});if(audit.error)throw audit.error;
  return createSuccessResponse(exportData);
 }catch{return createProblemResponse({type:"about:blank",title:"Exportação indisponível",status:503});}
}
