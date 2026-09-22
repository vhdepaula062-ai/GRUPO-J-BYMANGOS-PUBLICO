import { createProblemResponse } from "@/lib/response";
export const dynamic = "force-dynamic";
/** No provider is homologated. Never acknowledge or mutate money from unverified events. */
export async function POST() {
  return createProblemResponse({
    type: "https://api.grupoj.com.br/v1/errors/payment-provider-not-ready",
    title: "Integração de pagamentos não homologada",
    status: 503,
    detail: "Nenhum evento foi processado. A integração exige validação oficial, consulta ao provedor e persistência atômica e idempotente de pagamentos e assinaturas."
  });
}
