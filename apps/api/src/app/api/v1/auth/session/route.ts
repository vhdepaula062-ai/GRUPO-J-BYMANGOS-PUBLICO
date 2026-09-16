import { NextRequest } from "next/server";
import { authenticateRequest, getAdminDatabase, isAuthFailure } from "@/lib/auth";
import { createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthFailure(auth)) return auth;
  const admin = getAdminDatabase();
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    admin.from("profiles").select("full_name, email, cpf_masked, mfa_enabled").eq("id", auth.user.id).single(),
    admin.from("user_roles").select("roles(code)").eq("user_id", auth.user.id)
  ]);
  return createSuccessResponse({
    id: auth.user.id,
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? auth.user.email,
    cpfMasked: profile?.cpf_masked ?? null,
    roles: (roleRows ?? []).map((row: any) => row.roles?.code).filter(Boolean),
    mfaEnabled: profile?.mfa_enabled ?? false,
    isAuthenticated: true
  });
}
