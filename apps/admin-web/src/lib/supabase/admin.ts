import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function createAdminServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://usqplgujxhksjduuturw.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return adminClient;
}
