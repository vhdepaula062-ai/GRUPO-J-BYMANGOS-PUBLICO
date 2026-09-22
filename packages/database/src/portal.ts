import type { SupabaseClient } from "./index";
export async function readPortalRequests(db:SupabaseClient,before?:string){
 let query=db.from("portal_requests").select("id,protocol,kind,subject,status,created_at,updated_at,messages:portal_request_messages(id,from_admin,body,created_at)").order("created_at",{ascending:false}).limit(50);
 if(before) query=query.lt("created_at",before);
 const {data,error}=await query;
 if(error)throw new Error("Não foi possível carregar os protocolos.");
 return (data??[]).map(r=>({...r,messages:(r.messages??[]).sort((a,b)=>a.created_at.localeCompare(b.created_at))}));
}
export const emptySettings={controllerName:"",controllerDocument:"",privacyEmail:"",supportEmail:"",privacyText:"",termsText:"",legalPublished:false};
export async function readSettings(db:SupabaseClient){
 const {data,error}=await db.from("remote_configurations").select("id,value,version,updated_at").eq("key","ecosystem_settings").single();
 if(error)throw new Error("Não foi possível carregar a configuração.");
 return {...data,value:{...emptySettings,...data.value}};
}
export function publicSettings(value:typeof emptySettings){
 return {controllerName:value.controllerName,controllerDocument:value.controllerDocument,privacyEmail:value.privacyEmail,supportEmail:value.supportEmail,legalPublished:!!value.legalPublished,privacyText:value.legalPublished?value.privacyText:"",termsText:value.legalPublished?value.termsText:""};
}
