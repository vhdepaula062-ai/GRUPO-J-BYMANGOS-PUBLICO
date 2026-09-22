import { NotificationCenter } from "@/components/NotificationCenter";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function NotificationsPage(){
  const db=await createServerSupabaseClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) return <NotificationCenter initialError="Acesso não autorizado." />;
  let query=db.from("operational_notifications").select("id,title,message,severity,entity_type,created_at").eq("audience","admin").order("created_at",{ascending:false}).order("id",{ascending:false}).limit(51);

  const {data,error}=await query;
  if(error) return <NotificationCenter initialError="Central de notificações indisponível." />;
  const items=(data??[]).slice(0,50);
  const receipts=items.length ? await db.from("notification_reads").select("notification_id").eq("user_id",user.id).in("notification_id",items.map(n=>n.id)) : {data:[],error:null};
  if(receipts.error) return <NotificationCenter initialError="Não foi possível conferir as leituras." />;
  const read=new Set((receipts.data??[]).map(n=>n.notification_id));
  const last=items.at(-1);
  return <NotificationCenter initialItems={items.map(n=>({...n,read:read.has(n.id)}))} initialNext={(data?.length??0)>50 && last ? `${new Date(last.created_at).toISOString()}|${last.id}` : null} />;
}
