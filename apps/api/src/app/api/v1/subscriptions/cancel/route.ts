import { NextRequest } from "next/server";
import { authenticateRequest,isAuthFailure } from "@/lib/auth";
import { createProblemResponse,createSuccessResponse } from "@/lib/response";
export async function POST(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const body=await request.json().catch(()=>({}));
 if(typeof body.id!=="string"||!/^[a-f0-9-]{36}$/i.test(body.id))return createProblemResponse({type:"about:blank",title:"Assinatura inválida",status:422});
 const {error}=await auth.db.rpc("cancel_own_subscription",{p_id:body.id});
 if(error)return createProblemResponse({type:"about:blank",title:"Cancelamento não concluído",status:409,detail:"Confirme a assinatura. Contratos vinculados a gateway exigem integração homologada."});
 return createSuccessResponse({message:"Cancelamento registrado para o fim da vigência. Não há estorno automático."});
}
