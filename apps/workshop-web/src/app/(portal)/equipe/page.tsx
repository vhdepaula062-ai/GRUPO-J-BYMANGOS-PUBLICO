import {ActionForm} from "@grupo-j/ui-web";
import {getMyWorkshop} from "@/lib/queries";
import {createAuthorizedWorkshopClient} from "@/lib/supabase/authorized";
import {manageMember} from "./actions";
export const dynamic="force-dynamic";
const roles={owner:"Proprietário",manager:"Gerente",attendant:"Atendente",finance:"Financeiro"};
export default async function Team(){
 const w=await getMyWorkshop();const id=w?.organization?.id as string|undefined;if(!id)return <p>Oficina não localizada.</p>;
 const db=await createAuthorizedWorkshopClient(id);const {data,error}=await db.from("organization_members").select("user_id,role,is_active,profile:profiles(full_name,email)").eq("organization_id",id).order("created_at");if(error)throw new Error("Não foi possível consultar a equipe.");
 const manage=["owner","manager"].includes(w?.role??"");
 return <div className="space-y-6"><h1 className="text-2xl font-bold">Equipe e acessos</h1><p>Proprietários e gerentes gerenciam a equipe. Atendentes executam serviços; o financeiro consulta informações, sem validar vouchers.</p>
 {manage&&<section className="p-6 bg-white rounded-xl border"><h2 className="font-bold">Vincular conta existente</h2><p className="text-sm">O colaborador pode criar sua conta em <a className="underline" href="/colaborador">Cadastro de colaborador</a>. Depois, informe o e-mail confirmado.</p><ActionForm action={manageMember} submitLabel="Vincular colaborador"><label>E-mail<input className="block border p-2 w-full" type="email" name="email" required/></label><label>Função<select name="role" defaultValue="attendant" className="block border p-2">{Object.entries(roles).filter(([r])=>w?.role==="owner"||!["owner","manager"].includes(r)).map(([r,n])=><option key={r} value={r}>{n}</option>)}</select></label><input type="hidden" name="active" value="true"/></ActionForm></section>}
 {(data??[]).map(m=>{const p=m.profile as unknown as {full_name:string;email:string};return <section key={m.user_id} className="bg-white border rounded-xl p-5"><h2 className="font-bold">{p?.full_name}</h2><p>{p?.email}</p><p>{roles[m.role as keyof typeof roles]??m.role} · {m.is_active?"Ativo":"Desativado"}</p>{manage&&<ActionForm action={manageMember} submitLabel="Atualizar acesso"><input type="hidden" name="email" value={p?.email??""}/><select name="role" defaultValue={m.role} className="border p-2">{Object.entries(roles).map(([r,n])=><option key={r} value={r}>{n}</option>)}</select><select name="active" defaultValue={String(m.is_active)} className="border p-2"><option value="true">Ativo</option><option value="false">Desativado</option></select></ActionForm>}</section>})}</div>;
}
