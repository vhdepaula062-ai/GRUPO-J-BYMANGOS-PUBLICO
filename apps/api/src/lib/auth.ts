import { NextRequest } from "next/server";
import { createRequestClient, createServerAdminClient, SupabaseClient } from "@grupo-j/database";
import { createProblemResponse } from "./response";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.includes("placeholder") || value.includes("dummy")) {
    throw new Error(`Configuração obrigatória ausente: ${name}`);
  }
  return value;
}

export function getAdminDatabase(): SupabaseClient {
  return createServerAdminClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function getPublicDatabase(): SupabaseClient {
  return createRequestClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export type AuthenticatedRequest = {
  user: { id: string; email?: string };
  accessToken: string;
  db: SupabaseClient;
};

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedRequest | ReturnType<typeof createProblemResponse>> {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/authentication-required",
      title: "Autenticação necessária",
      status: 401,
      detail: "Envie um access token válido no cabeçalho Authorization."
    });
  }

  try {
    const db = createRequestClient(
      requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      accessToken
    );
    const { data, error } = await db.auth.getUser(accessToken);
    if (error || !data.user) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/invalid-token",
        title: "Sessão inválida ou expirada",
        status: 401,
        detail: "Faça login novamente para continuar."
      });
    }

    // Check fresh identity metadata controlled by administrators, not editable user metadata.
    if (data.user.app_metadata?.account_status === "suspended") {
      return createProblemResponse({type:"https://api.grupoj.com.br/v1/errors/account-suspended",title:"Acesso suspenso",status:403,detail:"Contate o atendimento para revisar sua conta."});
    }
    const {data: profile,error: profileError} = await getAdminDatabase().from("profiles").select("id").eq("id",data.user.id).maybeSingle();
    if (profileError || !profile) return createProblemResponse({type:"https://api.grupoj.com.br/v1/errors/identity-unavailable",title:"Cadastro indisponível",status:503,detail:"Não foi possível confirmar o cadastro."});

    const permitted=await db.rpc("is_session_permitted");
    if(permitted.error||permitted.data!==true)return createProblemResponse({type:"about:blank",title:"Confirmação de autenticação necessária",status:403,detail:"Conclua a autenticação ou entre novamente."});
    return {
      user: { id: data.user.id, email: data.user.email },
      accessToken,
      db
    };
  } catch (error) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/service-unavailable",
      title: "Serviço de identidade indisponível",
      status: 503,
      detail: error instanceof Error ? error.message : "Configuração de identidade inválida."
    });
  }
}

export function isAuthFailure(value: AuthenticatedRequest | Response): value is Response {
  return value instanceof Response;
}

export async function getCustomerId(db: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await db.from("customers").select("id").eq("profile_id", userId).single();
  if (error || !data?.id) throw new Error("CUSTOMER_NOT_FOUND");
  return data.id as string;
}
