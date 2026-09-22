import {ActionForm} from "@grupo-j/ui-web";
import {createAuthorizedAdminClient} from "@/lib/supabase/authorized";
import {getAuthenticatedUser} from "@/lib/supabase/server";
import {manageAdmin} from "./actions";
export const dynamic="force-dynamic";
export default async function Users(){
 const db=await createAuthorizedAdminClient();const user=await getAuthenticatedUser();
 const {data,error}=await db.from("user_roles").select("user_id,role:roles!inner(code,name),profile:profiles(full_name,email)").in("role.code",["platform_admin","platform_owner"]);
 if(error)throw new Error("Não foi possível consultar os administradores.");
 const rows=(data??[]) as unknown as Array<{user_id:string;role:{code:string;name:string};profile:{full_name:string;email:string}}>;
 const owner=rows.some(r=>r.user_id===user?.id&&r.role.code==="platform_owner");
 return <div className="space-y-6"><h1 className="text-2xl font-bold">Acessos administrativos</h1><p>Permissões verificadas no banco a cada operação. Alterações de administradores exigem proprietário e login recente.</p>{owner&&<ActionForm action={manageAdmin} submitLabel="Atualizar acesso"><label>E-mail da conta existente<input className="block border p-2 w-full" name="email" type="email" required/></label><select className="border p-2" name="enabled"><option value="true">Conceder administrador</option><option value="false">Revogar administrador</option></select></ActionForm>}{rows.map(r=><section className="border bg-white rounded-xl p-5" key={r.user_id+r.role.code}><h2 className="font-bold">{r.profile?.full_name}</h2><p>{r.profile?.email}</p><p>{r.role.name}</p></section>)}</div>;
}
