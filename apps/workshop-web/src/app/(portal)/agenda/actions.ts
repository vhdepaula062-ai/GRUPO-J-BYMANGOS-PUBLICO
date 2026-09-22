"use server";
import { createAuthorizedWorkshopClient } from "@/lib/supabase/authorized";
import { revalidatePath } from "next/cache";
import type { AppointmentRow } from "@/lib/queries";
export async function createAppointmentAction(workshopId:string,input:Omit<AppointmentRow,"id">):Promise<{success:boolean;appointment?:AppointmentRow;error?:string}>{
  try {
    const db=await createAuthorizedWorkshopClient(workshopId,true);
    if (!input.customerName?.trim() || input.customerName.length>160 || !input.vehicle?.trim() || input.vehicle.length>100 || !input.service?.trim() || input.service.length>100 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !["morning","afternoon","flexible"].includes(input.shift) || !["confirmed","completed","in_progress","canceled"].includes(input.status) || (input.notes?.length ?? 0)>2000 || input.phone.length>30) return {success:false,error:"Confira nome, veículo, serviço, data e horário do agendamento."};
    const {data,error}=await db.from("appointments").insert({workshop_id:workshopId,customer_name:input.customerName.trim(),customer_phone:input.phone.trim(),vehicle_info:input.vehicle.trim(),service_type:input.service.trim(),appointment_date:input.date,shift:input.shift,status:input.status,notes:input.notes?.trim() || null}).select("id").single();
    if(error || !data)return {success:false,error:"Não foi possível salvar o agendamento."};
    revalidatePath("/agenda");
    return {success:true,appointment:{...input,id:data.id}};
  }catch{return {success:false,error:"Operação não autorizada ou serviço indisponível."};}
}
export async function deleteAppointmentAction(workshopId:string,appointmentId:string):Promise<{success:boolean;error?:string}>{
  return updateAppointmentStatusAction(workshopId,appointmentId,"canceled");
}
export async function updateAppointmentStatusAction(workshopId:string,appointmentId:string,status:AppointmentRow["status"]):Promise<{success:boolean;error?:string}>{
  try{
    const db=await createAuthorizedWorkshopClient(workshopId,true);
    if(!["confirmed","completed","in_progress","canceled"].includes(status))return {success:false,error:"Estado inválido."};
    const {data,error}=await db.from("appointments").update({status,updated_at:new Date().toISOString()}).eq("workshop_id",workshopId).eq("id",appointmentId).select("id").maybeSingle();
    if(error || !data)return {success:false,error:"Agendamento não encontrado. Registros anteriores precisam ser importados para a agenda."};
    revalidatePath("/agenda");return {success:true};
  }catch{return {success:false,error:"Operação não autorizada ou serviço indisponível."};}
}
