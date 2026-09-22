import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const {data,error}=await auth.db.rpc("get_own_benefit_balances");
 return error?createProblemResponse({type:"about:blank",title:"Benefícios indisponíveis",status:503}):createSuccessResponse(data);
}

export async function POST(request: NextRequest) {
 const auth=await authenticateRequest(request); if(isAuthFailure(auth))return auth;
 const parsed=z.object({vehicleId:z.string().uuid(),benefitDefinitionId:z.string().uuid()}).strict().safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return createProblemResponse({type:"about:blank",title:"Selecione o veículo e o benefício válidos.",status:422});
 const {data,error}=await auth.db.rpc("create_benefit_voucher",{p_vehicle_id:parsed.data.vehicleId,p_benefit_definition_id:parsed.data.benefitDefinitionId});
 if(error){
  const messages:Record<string,string>={BENEFIT_GRACE_PERIOD:"Benefício ainda em carência.",SUBSCRIPTION_INACTIVE:"Assinatura fora da vigência.",BENEFIT_BALANCE_EXHAUSTED:"Saldo do benefício esgotado.",WORKSHOP_NOT_ACTIVE:"Selecione uma oficina ativa.",ACTIVE_VOUCHER_EXISTS:"Já existe um voucher ativo para este benefício.",VEHICLE_NOT_FOUND:"Veículo indisponível para esta conta.",BENEFIT_INACTIVE:"Benefício indisponível.",CUSTOMER_NOT_FOUND:"Cadastro de motorista não encontrado."};
  const message=messages[error.message];
  return createProblemResponse({type:"about:blank",title:message??"Não foi possível emitir o voucher.",status:message?403:503});
 }
 return createSuccessResponse(data,200);
}
