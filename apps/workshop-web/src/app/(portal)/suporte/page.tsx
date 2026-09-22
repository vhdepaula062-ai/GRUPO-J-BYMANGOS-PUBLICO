import { ActionForm } from "@grupo-j/ui-web";
import { readPortalRequests } from "@grupo-j/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { replyRequest,openRequest, } from "./actions";
export const dynamic="force-dynamic";
const labels:Record<string,string>={open:"Aberto",in_progress:"Em atendimento",answered:"Respondido",closed:"Encerrado"};
export default async function RequestPage({searchParams}:{searchParams:Promise<{before?:string}>}){
 const db=await createServerSupabaseClient();const {data:{user},error}=await db.auth.getUser();if(error||!user)throw new Error("Sessão inválida.");
 const {before}=await searchParams;const requests=await readPortalRequests(db,before&&Number.isFinite(Date.parse(before))?new Date(before).toISOString():undefined);
 return <div className="mx-auto max-w-4xl space-y-6"><h1 className="text-2xl font-bold">Atendimento e solicitações</h1><p>Converse com a administração e acompanhe os protocolos. Não envie senhas ou dados de cartão.</p><section className="rounded-xl border bg-white p-5"><h2 className="mb-4 font-bold">Abrir solicitação</h2><ActionForm action={openRequest} submitLabel="Registrar protocolo" reset><label>Tipo<select name="kind"><option value="support">Suporte</option><option value="privacy">Privacidade e meus dados</option></select></label><label>Assunto<input name="subject" required minLength={5} maxLength={160}/></label><label>Descrição<textarea name="body" required minLength={5} maxLength={4000} rows={4}/></label></ActionForm></section>
 {!requests.length&&<p>Nenhum protocolo registrado.</p>}{requests.map(r=><section key={r.id} className="rounded-xl border bg-white p-5 space-y-3"><p className="text-xs text-slate-500 break-all">{r.protocol}</p><h2 className="font-bold">{r.subject}</h2><p>{r.kind==='privacy'?'Privacidade':'Suporte'} • {labels[r.status]}</p><div className="space-y-3">{r.messages.map(m=><div key={m.id} className={m.from_admin?'rounded-lg bg-blue-50 p-3':'rounded-lg bg-slate-50 p-3'}><p className="text-xs font-semibold">{m.from_admin?'Administração':'Solicitante'} • {new Date(m.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p><p className="whitespace-pre-wrap break-words">{m.body}</p></div>)}</div><ActionForm action={replyRequest} submitLabel="Enviar resposta" reset><input type="hidden" name="id" value={r.id}/><label>Mensagem<textarea name="body" required minLength={5} maxLength={4000} rows={3}/></label></ActionForm></section>)}
 {requests.length===50&&<a className="text-blue-700 underline" href={`?before=${encodeURIComponent(requests.at(-1)!.created_at)}`}>Protocolos anteriores</a>}</div>;
}
