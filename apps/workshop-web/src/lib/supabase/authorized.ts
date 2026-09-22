import "server-only";
import { createServerSupabaseClient } from "./server";
import { createAdminServerClient } from "./admin";
export async function createAuthorizedWorkshopClient(workshopId: string, write = false) {
  const session = await createServerSupabaseClient();
  const {data:{user},error} = await session.auth.getUser();
  if (error || !user || user.app_metadata?.account_status === "suspended") throw new Error("Sessão inválida.");
  const {data:member,error:membershipError} = await session.from("organization_members").select("role,organization:organizations(status)").eq("user_id",user.id).eq("organization_id",workshopId).eq("is_active",true).maybeSingle();
  const organization = member?.organization as unknown as {status:string} | null;
  if (membershipError || !member || organization?.status !== "active" || (write && !["owner","manager","attendant"].includes(member.role))) throw new Error("Operação não autorizada nesta oficina.");
  const assurance = await session.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error || !assurance.data || assurance.data.currentLevel !== "aal2") throw new Error("Confirmação de autenticação necessária.");
  return createAdminServerClient();
}
