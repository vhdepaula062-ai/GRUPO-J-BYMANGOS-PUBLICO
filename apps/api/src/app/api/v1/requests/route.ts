import { NextRequest } from "next/server";
import { readPortalRequests } from "@grupo-j/database";
import { portalRequestSchema,portalReplySchema } from "@grupo-j/validation";
import { authenticateRequest,isAuthFailure } from "@/lib/auth";
import { createProblemResponse,createSuccessResponse } from "@/lib/response";
export const dynamic="force-dynamic";
const fail=(status=422)=>createProblemResponse({type:"about:blank",title:"Solicitação não concluída",status,detail:"Confira os dados e o acesso ao protocolo."});
export async function GET(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const before=request.nextUrl.searchParams.get("before")??undefined;
 if(before&&!Number.isFinite(Date.parse(before)))return fail();
 try{return createSuccessResponse(await readPortalRequests(auth.db,before));}catch{return fail(503);}
}
export async function POST(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const parsed=portalRequestSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail();
 const {kind,subject,body}=parsed.data;
 const {data,error}=await auth.db.rpc("open_portal_request",{p_kind:kind,p_subject:subject,p_body:body});
 return error?fail():createSuccessResponse({id:data},201);
}
export async function PATCH(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const parsed=portalReplySchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail();
 const {id,body}=parsed.data;
 const {error}=await auth.db.rpc("reply_portal_request",{p_id:id,p_body:body});
 return error?fail():createSuccessResponse({success:true});
}
