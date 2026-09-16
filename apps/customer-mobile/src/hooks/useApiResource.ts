import { useCallback, useEffect, useState } from "react";
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
  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}
