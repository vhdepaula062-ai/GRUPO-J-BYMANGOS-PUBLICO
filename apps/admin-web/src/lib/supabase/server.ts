import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cria um cliente Supabase para uso no lado do SERVER (Server Components, Route Handlers, Server Actions).
 * Lê e escreve cookies via next/headers para manter a sessão sincronizada.
 */
export async function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase não configurado");
  const cookieStore = await cookies();

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.account_status === "suspended") {
    return null;
  }

  return user;
}

export async function checkIsAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;

  const validRoles = ["platform_admin", "platform_owner"];

  try {
    const supabase = await createServerSupabaseClient();
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role:roles!inner(code, name)")
      .eq("user_id", user.id);

    if (userRoles && userRoles.length > 0) {
      const isAdminRole = userRoles.some((ur: any) => {
        const code = ur.role?.code;
        return (
          validRoles.includes(code)
        );
      });
      if (isAdminRole) return true;
    }
  } catch {
    // Falha fechada
  }

  return false;
}

/**
 * Exige reautenticação recente para ações sensíveis (ex: exclusão de dados, alteração de permissões).
 * Valida a criação da sessão atual no banco, limitada a 15 minutos.
 */
export async function assertRecentAuthentication(maxAgeMinutes = 15): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Sessão inválida ou não autenticada." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("has_recent_session", {
    p_max_age_minutes: Math.min(15, maxAgeMinutes)
  });
  if (error || data !== true) {
    return {
      success: false,
      error: "Reautenticação obrigatória. Por segurança, saia e entre novamente para realizar esta ação."
    };
  }

  return { success: true };
}
