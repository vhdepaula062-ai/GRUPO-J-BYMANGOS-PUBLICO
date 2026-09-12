import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Sessão padrão para desenvolvimento/testes locais ou com token
  const sessionUser = {
    id: "usr-00000000-0000-0000-0000-000000000001",
    fullName: "Joaquim (Proprietário Grupo J)",
    email: "joaquim@grupoj.com.br",
    cpfMasked: "***.456.789-**",
    roles: ["platform_owner"],
    mfaEnabled: true,
    isAuthenticated: Boolean(authHeader),
    activeBreakGlass: false
  };

  return createSuccessResponse(sessionUser, 200);
}
