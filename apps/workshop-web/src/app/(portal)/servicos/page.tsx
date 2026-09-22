import Link from "next/link";
import { ActionForm } from "@grupo-j/ui-web";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";
import { advanceService } from "./actions";
export const dynamic="force-dynamic";
const labels:Record<string,string>={open:"Aberto",in_progress:"Em andamento",completed:"Concluído",canceled:"Cancelado"};
export default async function ServicesPage(){
 const workshop=await getMyWorkshop();if(!workshop)throw new Error("Oficina não identificada.");
 const db=await createServerSupabaseClient();
 const {data:orders,error}=await db.from("service_orders").select("id,protocol,status,notes,odometer_km,created_at,completed_at,vehicle:vehicles(plate,brand,model),redemption:benefit_redemptions(benefit:benefit_definitions(name))").eq("workshop_id",workshop.organization.id).order("created_at",{ascending:false}).limit(100);
 if(error)throw new Error("Não foi possível carregar os atendimentos.");
 const canWrite=['owner','manager','attendant'].includes(workshop.role)&&workshop.organization.status==='active';
 return <div className="mx-auto max-w-5xl space-y-6"><h1 className="text-2xl font-bold">Atendimentos e histórico</h1><p>A validação de voucher abre automaticamente a ordem de serviço. Registre o início e a conclusão para atualizar o histórico do motorista.</p><Link className="text-blue-700 underline" href="/check-in">Validar novo voucher</Link>
 {!orders?.length&&<p>Nenhum atendimento registrado.</p>}{orders?.map((o:any)=><section key={o.id} className="rounded-xl border bg-white p-5 space-y-3"><p className="text-xs font-mono break-all">{o.protocol}</p><h2 className="font-bold">{o.vehicle?.plate} — {o.vehicle?.brand} {o.vehicle?.model}</h2><p>{o.redemption?.benefit?.name??'Atendimento avulso'} • {labels[o.status]}</p><p className="text-sm">{new Date(o.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p><p className="whitespace-pre-wrap">{o.notes}</p>{o.completed_at&&<p>Concluído em {new Date(o.completed_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p>}
 {canWrite&&['open','in_progress'].includes(o.status)&&<ActionForm action={advanceService} submitLabel="Atualizar atendimento"><input type="hidden" name="id" value={o.id}/><label>Situação<select name="status">{o.status==='open'?<option value="in_progress">Iniciar atendimento</option>:<option value="completed">Concluir atendimento</option>}<option value="canceled">Cancelar atendimento</option></select></label><label>Quilometragem<input name="odometer" type="number" min={o.odometer_km??0} max={10000000} defaultValue={o.odometer_km??''}/></label><label>Descrição do serviço e observações<textarea name="notes" maxLength={4000} rows={3} defaultValue={o.notes??''}/></label></ActionForm>}</section>)}
 </div>;
}
