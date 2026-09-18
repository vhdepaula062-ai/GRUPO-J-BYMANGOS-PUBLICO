import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
          // Ignorado com segurança quando chamado de Server Component
        }
      }
    }
  });
}

export async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Exige reautenticação recente para ações sensíveis da oficina.
 */
export async function assertRecentAuthentication(maxAgeMinutes = 15): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Sessão inválida ou não autenticada." };
  }

  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  if (now - lastSignIn > maxAgeMs) {
    return {
      success: false,
      error: "Reautenticação obrigatória. Por segurança, confirme sua senha ou faça novo login para realizar esta ação."
    };
  }

  return { success: true };
}
