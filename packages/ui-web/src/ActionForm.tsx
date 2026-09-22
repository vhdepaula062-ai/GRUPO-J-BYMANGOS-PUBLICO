"use client";
import React,{useState} from "react";
import { useRouter } from "next/navigation";
export function ActionForm({action,children,submitLabel="Salvar",reset=false}:{action:(form:FormData)=>Promise<{message:string}>,children:React.ReactNode,submitLabel?:string,reset?:boolean}){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState(false);const router=useRouter();
 return <form className="space-y-4" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const data=new FormData(form);setBusy(true);setMessage("");setError(false);try{const result=await action(data);setMessage(result.message);if(reset)form.reset();router.refresh();}catch(cause){setError(true);setMessage(cause instanceof Error?cause.message:"Não foi possível concluir a operação.");}finally{setBusy(false);}}}>
  <fieldset disabled={busy} className="space-y-4 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:p-2 [&_input]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-300 [&_textarea]:p-2 [&_textarea]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:p-2 [&_label]:block [&_label]:text-sm [&_label]:font-medium">
   {children}<button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit">{busy?"Aguarde…":submitLabel}</button>
  </fieldset>{message&&<p role={error?"alert":"status"} className={error?"text-sm text-red-700":"text-sm text-emerald-700"}>{message}</p>}
 </form>;
}
