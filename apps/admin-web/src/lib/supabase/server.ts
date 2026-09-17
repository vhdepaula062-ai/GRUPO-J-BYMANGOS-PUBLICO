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

  const appRole = user.app_metadata?.role;
  const userRoleMeta = user.user_metadata?.account_type || user.user_metadata?.role;

  const validRoles = ["admin", "platform_admin", "platform_owner", "super_admin"];
  if (
    (typeof appRole === "string" && validRoles.includes(appRole)) ||
    (typeof userRoleMeta === "string" && validRoles.includes(userRoleMeta))
  ) {
    return true;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role:roles!inner(code, name)")
      .eq("user_id", user.id);

    if (userRoles && userRoles.length > 0) {
      const isAdminRole = userRoles.some((ur: any) => {
        const code = ur.role?.code;
        const name = ur.role?.name;
        return (
          validRoles.includes(code) ||
          name === "Administrador" ||
          name === "Administrador da plataforma" ||
          name === "Proprietário da plataforma" ||
          name === "Super Administrador"
        );
      });
      if (isAdminRole) return true;
    }
  } catch {
    // Falha fechada
  }

  return false;
}

