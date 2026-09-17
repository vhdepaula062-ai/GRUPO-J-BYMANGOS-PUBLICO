import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cria um cliente Supabase para uso no lado do SERVER (Server Components, Route Handlers, Server Actions).
 * Lê e escreve cookies via next/headers para manter a sessão sincronizada.
 */
export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase não configurado");
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

export async function checkIsAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;

  if (user.app_metadata?.role === "admin" || user.user_metadata?.account_type === "admin") {
    return true;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role:roles!inner(name)")
      .eq("user_id", user.id)
      .eq("roles.name", "admin")
      .maybeSingle();

    if (userRole) return true;
  } catch {
    // Falha fechada
  }

  return false;
}

