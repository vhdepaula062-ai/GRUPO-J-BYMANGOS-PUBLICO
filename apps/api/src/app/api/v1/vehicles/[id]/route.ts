import {z} from "@grupo-j/validation";
import { NextRequest } from "next/server";
import { authenticateRequest, getCustomerId, isAuthFailure } from "@/lib/auth";
import { createProblemResponse, createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request); if (isAuthFailure(auth)) return auth;
  const customerId = await getCustomerId(auth.db, auth.user.id);
  const parsed=z.object({brand:z.string().trim().min(1).max(80).optional(),model:z.string().trim().min(1).max(120).optional(),modelYear:z.number().int().min(1900).max(new Date().getFullYear()+2).optional(),manufactureYear:z.number().int().min(1900).max(new Date().getFullYear()+1).optional(),color:z.string().trim().min(1).max(40).optional(),isActive:z.boolean().optional()}).strict().refine(v=>Object.keys(v).length>0).safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return createProblemResponse({type:"about:blank",title:"Dados do veículo inválidos",status:422});
  const input:Record<string,unknown>=parsed.data;
  const allowed: Record<string, unknown> = {};
  for (const [apiKey, dbKey] of Object.entries({ brand: "brand", model: "model", modelYear: "model_year", manufactureYear: "manufacture_year", color: "color", isActive: "is_active" })) if (input[apiKey] !== undefined) allowed[dbKey] = input[apiKey];
  const { data, error } = await auth.db.from("vehicles").update(allowed).eq("id", (await params).id).eq("customer_id", customerId).select().maybeSingle();
  if (error) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/vehicle-update-failed", title: "Veículo não atualizado", status: 500, detail: error.message });
  if (!data) return createProblemResponse({ type: "https://api.grupoj.com.br/v1/errors/not-found", title: "Veículo não encontrado", status: 404, detail: "O veículo não pertence ao usuário autenticado." });
  return createSuccessResponse(data);
}
