import "server-only";
import { checkIsAdmin, createServerSupabaseClient } from "./server";
import { createAdminServerClient } from "./admin";

/** Never bypass row security without verifying the caller of each action/read. */
export async function createAuthorizedAdminClient() {
  if (!(await checkIsAdmin())) throw new Error("Acesso administrativo não autorizado.");
  const session = await createServerSupabaseClient();
  const { data, error } = await session.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data || data.currentLevel !== "aal2") throw new Error("Confirmação de autenticação necessária.");
  return createAdminServerClient();
}
