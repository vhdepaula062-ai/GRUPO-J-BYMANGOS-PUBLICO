"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@supabase/supabase-js";
type Result="confirmed"|"invalid"|"missing"|"unavailable";
export default function Confirmation(){
 const [state,setState]=useState<Result|"checking">("checking");
 const verification=useRef<Promise<Result>|null>(null);
 useEffect(()=>{
  let active=true;
  if(!verification.current){
   const hash=new URLSearchParams(window.location.hash.slice(1));
   const query=new URLSearchParams(window.location.search);
   const access=hash.get("access_token");
   const hasError=hash.has("error")||query.has("error");
   const type=hash.get("type");
   // Discard all URL credentials immediately; never persist or pass them to the app.
   window.history.replaceState(null,"",window.location.pathname);
   verification.current=(async():Promise<Result>=>{
    if(hasError)return "invalid";
    if(!access)return "missing";
    if(type!=="signup"&&type!=="email")return "invalid";
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!url||!key)return "unavailable";
    try{
     const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
     const {data,error}=await client.auth.getUser(access);
     if(error)return error.status&&error.status>=500?"unavailable":"invalid";
     return data.user?.email_confirmed_at?"confirmed":"invalid";
    }catch{return "unavailable";}
   })();
  }
  verification.current.then(value=>{if(active)setState(value);});
  return ()=>{active=false;};
 },[]);
 const title=state==="checking"?"Conferindo a confirmação…":state==="confirmed"?"E-mail confirmado":state==="invalid"?"Link inválido ou expirado":state==="unavailable"?"Não foi possível conferir agora":"Confirme pelo link do e-mail";
 return <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-slate-50"><section className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
  <div className="mb-6 rounded-xl bg-[#00091D] p-4 w-full max-w-[300px]">
    <img src="/brand/grupo-j-horizontal.png" alt="Grupo J — Auto App" width={3409} height={568} className="block h-auto w-full object-contain" />
  </div>
  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" aria-live="polite">{title}</h1>
  <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
   {state==="confirmed"?<p>Seu e-mail foi confirmado. Volte ao aplicativo Grupo J e entre com seu e-mail e senha. Não é necessário digitar um código numérico.</p>:state==="checking"?<p>Aguarde enquanto conferimos a confirmação com segurança.</p>:state==="unavailable"?<p>Confira sua conexão e tente entrar no aplicativo. Se a confirmação ainda estiver pendente, solicite um novo link na tela “Confirme seu e-mail”.</p>:<><p>Abra o link mais recente recebido no seu e-mail. Se você já o usou, tente entrar no aplicativo com sua senha.</p><p>Se ainda não conseguir confirmar, volte ao aplicativo e use “Reenviar link de confirmação”.</p></>}
  </div>
  {state!=="checking"&&<><a className="mt-7 block rounded-xl bg-blue-700 px-5 py-4 text-center font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href="grupoj://login">Voltar ao aplicativo</a><p className="mt-4 text-sm leading-6 text-slate-500">Se estiver no computador ou o aplicativo não abrir, acesse o Grupo J manualmente no celular e toque em “Entrar”.</p></>}
 </section></main>;
}
