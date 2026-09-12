import { NextRequest } from "next/server";
import { createSuccessResponse, createProblemResponse } from "@/lib/response";
import { defaultLogger } from "@grupo-j/observability";

export const dynamic = "force-dynamic";

// Conjunto em memória para deduplicação rápida de eventos de webhook (idempotência)
const processedEventIds = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    const eventId = event.id || event.data?.id;
    if (!eventId) {
      return createProblemResponse({
        type: "https://api.grupoj.com.br/v1/errors/invalid-webhook",
        title: "Payload de Webhook Inválido",
        status: 400,
        detail: "Identificador do evento ausente no payload."
      });
    }

    // Verificação de Idempotência
    if (processedEventIds.has(eventId)) {
      defaultLogger.info("Evento de webhook duplicado ignorado com sucesso (idempotente)", { eventId });
      return createSuccessResponse({ message: "Evento já processado anteriormente.", eventId }, 200);
    }

    // Processamento do evento financeiro
    processedEventIds.add(eventId);

    defaultLogger.info("Evento financeiro processado com sucesso", {
      eventId,
      eventType: event.type || "payment_event"
    });

    return createSuccessResponse({
      received: true,
      eventId,
      status: "queued_for_outbox"
    }, 200);
  } catch (error) {
    return createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/webhook-failure",
      title: "Falha no processamento do webhook",
      status: 500,
      detail: error instanceof Error ? error.message : "Erro interno"
    });
  }
}
