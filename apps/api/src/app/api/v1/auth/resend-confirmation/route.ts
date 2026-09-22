import { NextRequest } from "next/server";
import { z } from "@grupo-j/validation";
import { getPublicDatabase } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";
import { CUSTOMER_EMAIL_CONFIRMATION_URL } from "@/lib/email-confirmation";
export const dynamic = "force-dynamic";
const schema = z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase())}).strict();
export async function POST(request: NextRequest) {
 const limited = await checkRateLimit(request,{maxRequests:5,windowMs:60000,keyPrefix:"resend-confirmation"});
 if(limited)return limited;
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return createProblemResponse({type:"about:blank",title:"E-mail inválido",status:422,detail:"Informe o e-mail usado no cadastro."});
 try {
  const {error}=await getPublicDatabase().auth.resend({type:"signup",email:parsed.data.email,options:{emailRedirectTo:CUSTOMER_EMAIL_CONFIRMATION_URL}});
  if(error?.status===429)return createProblemResponse({type:"about:blank",title:"Aguarde para reenviar",status:429,detail:"Aguarde alguns minutos antes de solicitar outro link."});
  if(error && (error.status===undefined || error.status>=500 || ["email_address_not_authorized","email_provider_disabled","unexpected_failure"].includes(error.code??"")))return createProblemResponse({type:"about:blank",title:"Envio indisponível",status:503,detail:"Não foi possível solicitar o e-mail agora. Tente mais tarde."});
  // Same response for absent, already-confirmed and pending accounts; no account enumeration.
  return createSuccessResponse({message:"Se o cadastro estiver aguardando confirmação, um novo link será enviado."});
 }catch{return createProblemResponse({type:"about:blank",title:"Envio indisponível",status:503,detail:"Tente novamente mais tarde."});}
}
