import { NextRequest } from "next/server";
import { authenticateRequest, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";
import { profileUpdateSchema } from "@grupo-j/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request:NextRequest){
 const auth=await authenticateRequest(request);if(isAuthFailure(auth))return auth;
 const parsed=profileUpdateSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return createProblemResponse({type:"about:blank",title:"Dados inválidos",status:422,detail:"Informe nome completo e telefone válido."});
 const {data,error}=await auth.db.from("profiles").update({full_name:parsed.data.fullName,phone:parsed.data.phone}).eq("id",auth.user.id).select("id,full_name,phone").single();
 return error?createProblemResponse({type:"about:blank",title:"Cadastro não atualizado",status:503}):createSuccessResponse(data);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const { data: customer, error } = await auth.db.from("customers").select(`
    id, assigned_workshop_id, workshop_assigned_at, next_workshop_change_allowed_at,
    profile:profiles(id, full_name, email, phone, cpf_masked),
    vehicles(id, plate, brand, model, model_year, manufacture_year, color, is_active),
    subscriptions(id, status, current_period_start, current_period_end, cancel_at_period_end, plan:plans(name, price_cents, currency)),
    workshop:organizations(id, trade_name, phone, organization_units(address_street, address_number, address_neighborhood, address_city, address_state))
  `).eq("profile_id", auth.user.id).single();
  if (error || !customer) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/customer-not-found", title: "Cadastro não encontrado", status: 404, detail: "O usuário autenticado não possui cadastro de motorista." });
  return createSuccessResponse(customer);
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const {data,error}=await auth.db.rpc("request_own_erasure");
  if(error)return createProblemResponse({type:"about:blank",title:"Solicitação não registrada",status:503});
  return createSuccessResponse(data,202);
}
