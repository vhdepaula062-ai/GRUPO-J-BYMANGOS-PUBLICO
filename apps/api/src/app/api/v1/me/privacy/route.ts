import {NextRequest} from "next/server";
import {authenticateRequest,isAuthFailure} from "@/lib/auth";
import {createSuccessResponse,createProblemResponse} from "@/lib/response";
export const dynamic="force-dynamic";
export async function GET(r:NextRequest){const a=await authenticateRequest(r);if(isAuthFailure(a))return a;const {data,error}=await a.db.from("account_erasure_requests").select("protocol,status,deadline_at,requested_at").eq("user_id",a.user.id).order("requested_at",{ascending:false}).limit(100);return error?createProblemResponse({type:"about:blank",title:"Pedidos indisponíveis",status:503}):createSuccessResponse(data);}
