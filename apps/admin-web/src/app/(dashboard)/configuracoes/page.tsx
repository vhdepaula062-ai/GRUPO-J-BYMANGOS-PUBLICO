import { ActionForm } from "@grupo-j/ui-web";
import { readSettings } from "@grupo-j/database";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { saveSettings,restoreSettings } from "./actions";
export const dynamic="force-dynamic";
export default async function SettingsPage(){
 const db=await createAuthorizedAdminClient();const config=await readSettings(db);
 const {data:history,error}=await db.from("configuration_revisions").select("id,version,created_at").order("version",{ascending:false}).limit(20);if(error)throw new Error("Histórico indisponível.");
 return <div className="mx-auto max-w-4xl space-y-6"><h1 className="text-2xl font-bold">Configurações do ecossistema</h1>
 <p>Versão {config.version}. Os dados oficiais e documentos podem permanecer em rascunho até a aprovação do responsável.</p>
 <section className="rounded-xl border bg-white p-6"><ActionForm action={saveSettings}>
 <input type="hidden" name="version" value={config.version}/>
 {([['controllerName','Razão social do controlador'],['controllerDocument','CNPJ do controlador'],['privacyEmail','E-mail de privacidade'],['supportEmail','E-mail de suporte']] as const).map(([key,label])=><label key={key}>{label}<input name={key} type={key.includes('Email')?'email':'text'} defaultValue={config.value[key]??''} maxLength={180}/></label>)}
 <label>Política de privacidade<textarea name="privacyText" rows={10} maxLength={40000} defaultValue={config.value.privacyText}/></label>
 <label>Termos de uso<textarea name="termsText" rows={10} maxLength={40000} defaultValue={config.value.termsText}/></label>
 <label><input type="checkbox" name="legalPublished" defaultChecked={config.value.legalPublished}/> Publicar documentos aprovados pelo responsável</label>
 </ActionForm></section>
 <section className="rounded-xl border bg-white p-6 space-y-3"><h2 className="font-bold">Regras em operação</h2><p>Troca de oficina: intervalo mínimo de 30 dias. Validade do voucher: 10 minutos. Consulte planos em Assinaturas e benefícios em Benefícios & Regras.</p><p>Gateway: integração futura. Nenhum pagamento é criado por esta configuração.</p></section>
 <section className="rounded-xl border bg-white p-6 space-y-4"><h2 className="font-bold">Histórico de versões</h2>{!history?.length&&<p>Nenhuma alteração publicada.</p>}{history?.map(row=><div key={row.id} className="border-t pt-3"><p>Versão {row.version} — {new Date(row.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p><ActionForm action={restoreSettings} submitLabel="Restaurar esta versão"><input type="hidden" name="version" value={config.version}/><input type="hidden" name="revision" value={row.id}/></ActionForm></div>)}</section>
 </div>;
}
