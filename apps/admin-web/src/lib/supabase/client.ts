import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cria um cliente Supabase para uso no lado do CLIENT (Browser Components).
 * Usa o @supabase/ssr que gerencia os cookies da sessão automaticamente.
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase não configurado");
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
