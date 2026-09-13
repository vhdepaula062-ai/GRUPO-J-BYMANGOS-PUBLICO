import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-grupo-j.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

/**
 * Cria um cliente Supabase para uso no lado do SERVER (Server Components, Route Handlers, Server Actions).
 * Lê e escreve cookies via next/headers para manter a sessão sincronizada.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // O método setAll pode ser chamado de um Server Component.
          // Isso pode ser ignorado com segurança se o middleware está atualizando a sessão.
        }
      }
    }
  });
}

/**
 * Retorna o usuário autenticado atual. Lança erro se não houver sessão.
 * Use em Server Components e Server Actions que exigem autenticação.
 */
export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
