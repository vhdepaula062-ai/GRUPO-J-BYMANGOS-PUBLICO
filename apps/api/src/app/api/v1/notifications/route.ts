import { NextRequest } from "next/server";
import { authenticateRequest,isAuthFailure } from "@/lib/auth";
import { createProblemResponse,createSuccessResponse } from "@/lib/response";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const before=request.nextUrl.searchParams.get("before");
 let query=auth.db.from("user_notifications").select("id,title,message,entity_type,created_at,read_at").eq("user_id",auth.user.id).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(51);
 if(before){const [date,id]=before.split("|");if(!date||!Number.isFinite(Date.parse(date))||!/^[a-f0-9-]{36}$/i.test(id??""))return createProblemResponse({type:"about:blank",title:"Página inválida",status:422});query=query.or(`created_at.lt.${new Date(date).toISOString()},and(created_at.eq.${new Date(date).toISOString()},id.lt.${id})`);}
 const {data,error}=await query;if(error)return createProblemResponse({type:"about:blank",title:"Notificações indisponíveis",status:503});
 const items=(data??[]).slice(0,50);const last=items.at(-1);
 return createSuccessResponse({items,next:(data?.length??0)>50&&last?`${last.created_at}|${last.id}`:null});
}
export async function PATCH(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const body=await request.json().catch(()=>({}));
 if(typeof body.id!=="string"||!/^[a-f0-9-]{36}$/i.test(body.id))return createProblemResponse({type:"about:blank",title:"Identificador inválido",status:422});
 const {data,error}=await auth.db.from("user_notifications").update({read_at:new Date().toISOString()}).eq("id",body.id).eq("user_id",auth.user.id).select("id").maybeSingle();
 if(error||!data)return createProblemResponse({type:"about:blank",title:"Notificação não encontrada",status:404});
 return createSuccessResponse({success:true});
}
