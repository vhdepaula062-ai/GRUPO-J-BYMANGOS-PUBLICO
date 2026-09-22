"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Realtime invalidation plus periodic recovery; never equates a socket with reconciliation. */
export function FinancialRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState("Conectando atualizações");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (!navigator.onLine || document.visibilityState === "hidden") return;
      clearTimeout(timer);
      timer = setTimeout(() => startTransition(() => router.refresh()), 300);
    };
    const offline = () => setMode("Sem conexão — valores podem estar desatualizados");
    const online = () => { setMode("Consultas periódicas a cada 30 segundos"); refresh(); };
    let cleanup = () => {};
    try {
      const db = createClient();
      let channel = db.channel("financial-panels");
      for (const table of ["payments", "subscriptions", "invoices", "plans"]) {
        channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
      }
      channel.subscribe(status => {
        if (!navigator.onLine) return offline();
        setMode(status === "SUBSCRIBED" ? "Canal conectado • conferência a cada 30 segundos" : "Consultas periódicas a cada 30 segundos");
        if (status === "SUBSCRIBED") refresh();
      });
      cleanup = () => { void db.removeChannel(channel); };
    } catch { setMode("Atualização automática indisponível; recarregue a página"); }
    const interval = setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    if (!navigator.onLine) offline();
    return () => {
      clearInterval(interval); clearTimeout(timer); cleanup();
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", online); window.removeEventListener("offline", offline);
    };
  }, [router]);
  return <p role="status" className="mb-3 text-sm text-slate-500">{pending ? "Atualizando consultas…" : mode}</p>;
}
