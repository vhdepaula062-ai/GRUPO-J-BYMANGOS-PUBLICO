import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { ApiClientError } from "@grupo-j/api-client";

export function useApiResource<T>(loader: () => Promise<{ data: T }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData((await loader()).data); }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Não foi possível carregar os dados."); }
    finally { setLoading(false); }
  }, [loader]);
  useFocusEffect(useCallback(() => {
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || (AppState.currentState != null && AppState.currentState !== "active")) return;
      inFlight = true;
      try {
        const result = await loader();
        if (active) { setData(result.data); setError(null); }
      } catch (cause) {
        if (active) setError(cause instanceof ApiClientError ? cause.message : "Não foi possível atualizar os dados.");
      } finally { inFlight = false; if (active) setLoading(false); }
    };
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 30000);
    const listener = AppState.addEventListener("change", state => { if (state === "active") void refresh(); });
    return () => { active = false; clearInterval(timer); listener.remove(); };
  }, [loader]));
  return { data, loading, error, reload };
}
