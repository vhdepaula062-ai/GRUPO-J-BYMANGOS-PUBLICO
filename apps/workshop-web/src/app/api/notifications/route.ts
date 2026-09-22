import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkshop } from "@/lib/queries";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) => NextResponse.json(data, {status,headers:{"Cache-Control":"private, no-store"}});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function context() {
  const db = await createServerSupabaseClient();
  const {data:{user},error} = await db.auth.getUser();
  if (error || !user) return null;
  const workshop = await getMyWorkshop();
  if (!workshop) return null;
  const organizationId = workshop.organization.id as string;
  return {db,user,organizationId};
}
export async function GET(request: NextRequest) {
  const ctx = await context();
  if (!ctx) return reply({error:"Acesso não autorizado."},401);
  let query = ctx.db.from("operational_notifications").select("id,title,message,severity,entity_type,created_at").eq("audience","workshop").order("created_at",{ascending:false}).order("id",{ascending:false}).limit(51);
  if (ctx.organizationId) query = query.eq("organization_id",ctx.organizationId);
  const before = request.nextUrl.searchParams.get("before");
  if (before) {
    const [date,id] = before.split("|");
    if (!date || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString() !== date || !uuid.test(id ?? "")) return reply({error:"Página inválida."},400);
    query = query.or(`created_at.lt.${date},and(created_at.eq.${date},id.lt.${id})`);
  }
  const {data,error} = await query;
  if (error) return reply({error:"Central de notificações indisponível. A configuração do banco precisa ser conferida."},503);
  const items = (data ?? []).slice(0,50);
  const ids = items.map(n=>n.id);
  const receipts = ids.length ? await ctx.db.from("notification_reads").select("notification_id").eq("user_id",ctx.user.id).in("notification_id",ids) : {data:[],error:null};
  if (receipts.error) return reply({error:"Não foi possível conferir a leitura das notificações."},503);
  const read = new Set((receipts.data ?? []).map(r=>r.notification_id));
  const last = items[items.length-1];
  return reply({items:items.map(n=>({...n,read:read.has(n.id)})),next:data!.length>50 && last ? `${new Date(last.created_at).toISOString()}|${last.id}` : null});
}
export async function POST(request: NextRequest) {
  const ctx = await context();
  if (!ctx) return reply({error:"Acesso não autorizado."},401);
  if (request.headers.get("origin") !== request.nextUrl.origin) return reply({error:"Origem não autorizada."},403);
  let id: unknown;
  try { id = (await request.json()).id; } catch { return reply({error:"Dados inválidos."},400); }
  if (typeof id !== "string" || !uuid.test(id)) return reply({error:"Identificador inválido."},400);
  let query = ctx.db.from("operational_notifications").select("id").eq("id",id).eq("audience","workshop");
  if (ctx.organizationId) query = query.eq("organization_id",ctx.organizationId);
  const {data,error} = await query.maybeSingle();
  if (error) return reply({error:"Central indisponível."},503);
  if (!data) return reply({error:"Notificação não encontrada."},404);
  const result = await ctx.db.from("notification_reads").upsert({notification_id:id,user_id:ctx.user.id,read_at:new Date().toISOString()},{onConflict:"notification_id,user_id",ignoreDuplicates:true});
  return result.error ? reply({error:"Não foi possível registrar a leitura."},503) : reply({success:true});
}
