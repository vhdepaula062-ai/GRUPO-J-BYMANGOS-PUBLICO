import { readSettings,publicSettings } from "@grupo-j/database";
import { getAdminDatabase } from "@/lib/auth";
import { createSuccessResponse,createProblemResponse } from "@/lib/response";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const db=getAdminDatabase();const config=await readSettings(db);
  const {data:plans,error}=await db.from("plans").select("id,name,audience,price_cents,currency,billing_interval_months").eq("is_active",true);if(error)throw error;
  return createSuccessResponse({version:config.version,settings:publicSettings(config.value),plans,gateway:{configured:false},features:{allowWorkshopChangeDays:30,voucherLifetimeSeconds:600}});
 }catch{return createProblemResponse({type:"about:blank",title:"Configuração indisponível",status:503});}
}
