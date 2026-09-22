"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
type Item = {id:string;title:string;message:string;severity:string;entity_type:string;created_at:string;read:boolean};
const destinations: Record<string,string> = {"portal_requests":"/suporte","payments":"/mensalidade","subscriptions":"/mensalidade","organizations":"/configuracoes","benefit_redemptions":"/check-in","service_orders":"/servicos","appointments":"/agenda","promotions":"/promocoes","customers":"/clientes"};
export function NotificationCenter({compact=false,initialItems=[],initialNext=null,initialError=""}:{compact?:boolean;initialItems?:Item[];initialNext?:string|null;initialError?:string}) {
  const [items,setItems]=useState<Item[]>(initialItems);
  const [error,setError]=useState(initialError);
  const [next,setNext]=useState<string|null>(initialNext);
  const [open,setOpen]=useState(!compact);
  const [loading,setLoading]=useState(false);
  const inFlight=useRef(false);
  const mounted=useRef(true);
  const load=useCallback(async(cursor?:string)=>{
    if(inFlight.current || !navigator.onLine || document.visibilityState === "hidden") return;
    inFlight.current=true; setLoading(true);
    try {
      const response=await fetch(`/api/notifications${cursor ? `?before=${encodeURIComponent(cursor)}` : ""}`,{cache:"no-store",signal:AbortSignal.timeout(10000)});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || "Central indisponível.");
      if(mounted.current){setItems(old=>cursor ? [...old,...data.items.filter((n:Item)=>!old.some(x=>x.id===n.id))] : data.items);setNext(data.next);setError("");}
    }catch(e){if(mounted.current)setError(e instanceof Error ? e.message : "Não foi possível atualizar as notificações.");}
    finally{inFlight.current=false;if(mounted.current)setLoading(false);}
  },[]);
  useEffect(()=>{
    mounted.current=true;
    void load();
    const refresh=()=>{void load();};
    const offline=()=>setError("Sem conexão. As notificações podem estar desatualizadas.");
    const timer=setInterval(refresh,15000);
    let cleanup=()=>{};
    try{
      const db=createClient();
      const channel=db.channel("operational-inbox").on("postgres_changes",{event:"INSERT",schema:"public",table:"operational_notifications"},refresh).subscribe(status=>{if(status==="SUBSCRIBED")refresh();});
      cleanup=()=>{void db.removeChannel(channel);};
    }catch{setError("Atualização por consulta periódica.");}
    window.addEventListener("online",refresh);window.addEventListener("offline",offline);document.addEventListener("visibilitychange",refresh);
    return()=>{mounted.current=false;clearInterval(timer);cleanup();window.removeEventListener("online",refresh);window.removeEventListener("offline",offline);document.removeEventListener("visibilitychange",refresh);};
  },[load]);
  const markRead=async(id:string)=>{
    try{
      const response=await fetch("/api/notifications",{method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(10000),body:JSON.stringify({id})});
      if(!response.ok)throw new Error("Não foi possível registrar a leitura.");
      setItems(old=>old.map(n=>n.id===id ? {...n,read:true}:n));
    }catch(e){setError(e instanceof Error ? e.message : "Central indisponível.");}
  };
  const unread=items.filter(n=>!n.read).length;
  return <div className={compact ? "relative" : "mx-auto max-w-4xl"}>
    {compact && <button type="button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={`Notificações: ${error ? "indisponível" : `${unread} não lidas nesta página`}`} className="rounded-xl border px-3 py-2 text-sm">🔔 {error ? "!" : unread ? `${unread}${next ? "+" : ""}` : ""}</button>}
    {open && <section aria-label="Central de notificações" className={compact ? "absolute right-0 top-12 z-50 w-[min(90vw,380px)] rounded-xl border bg-white p-4 shadow-xl" : "rounded-xl border bg-white p-6"}>
      <h2 className="mb-3 text-lg font-semibold">Notificações</h2>
      {error && <p role="alert" className="mb-3 text-sm text-amber-800">{error}</p>}
      <button type="button" disabled={loading} onClick={()=>void load()} className="mb-3 text-sm text-blue-700">{loading ? "Atualizando…" : "Atualizar"}</button>
      {!error && !loading && items.length===0 && <p className="text-sm text-slate-500">Nenhuma notificação registrada.</p>}
      <ul className={compact ? "max-h-80 overflow-y-auto space-y-3" : "space-y-3"}>
        {(compact ? items.slice(0,8) : items).map(n=><li key={n.id} className={`rounded-lg border p-3 ${n.read ? "bg-slate-50" : "bg-blue-50"}`}>
          <p className="font-semibold">{n.severity==="critical" ? "⚠ " : ""}{n.title}</p>
          <p className="text-sm text-slate-600">{n.message}</p>
          <time className="block text-xs text-slate-500" dateTime={n.created_at}>{new Date(n.created_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</time>
          <div className="mt-2 flex gap-4 text-sm"><Link href={destinations[n.entity_type] || "/"}>Ver no painel</Link>{!n.read && <button type="button" onClick={()=>void markRead(n.id)}>Marcar como lida</button>}</div>
        </li>)}
      </ul>
      {compact ? <Link className="mt-3 block text-sm text-blue-700" href="/notificacoes" onClick={()=>setOpen(false)}>Abrir central</Link> : next && <button type="button" disabled={loading} onClick={()=>void load(next)} className="mt-4 text-blue-700">Carregar anteriores</button>}
    </section>}
  </div>;
}
