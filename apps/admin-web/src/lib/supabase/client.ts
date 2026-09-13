import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-grupo-j.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

/**
 * Cria um cliente Supabase para uso no lado do CLIENT (Browser Components).
 * Usa o @supabase/ssr que gerencia os cookies da sessão automaticamente.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
