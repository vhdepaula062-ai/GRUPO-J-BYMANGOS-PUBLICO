import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function createBrowserClient(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export function createServerAdminClient(supabaseUrl: string, serviceRoleKey: string): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createRequestClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  accessToken?: string
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined
  });
}

export { SupabaseClient };
export * from "./portal";
