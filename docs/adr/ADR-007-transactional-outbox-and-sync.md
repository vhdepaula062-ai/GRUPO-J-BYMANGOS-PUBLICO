# ADR-007: Padrão Transactional Outbox para Sincronização Confiável de Eventos

## Status
Aprovado

## Contexto
Quando um pagamento de assinatura é confirmado ou um benefício automotivo é resgatado na oficina, múltiplos sistemas precisam reagir (atualizar saldo de direitos, notificar o motorista por push, enviar comprovante e emitir evento analítico). Realizar chamadas de rede externas diretamente dentro da requisição HTTP do cliente gera risco de dados inconsistentes caso a rede falhe após a gravação no banco de dados.

## Decisão
Adotar o padrão **Transactional Outbox**:
1. Toda operação de mutação crítica grava seus dados na tabela de domínio e, dentro da **mesma transação SQL**, insere um registro na tabela `outbox_events`.
2. Um processo em segundo plano (ou trigger Supabase Realtime) escuta os registros de `outbox_events` com status `PENDING`, despacha as mensagens para os serviços externos (Push, Webhooks, E-mail) e marca o evento como `PROCESSED`.
3. Em caso de falha de conexão com os serviços externos, o outbox utiliza estratégia de retentativas exponenciais com *Dead-Letter Queue* (DLQ).

## Consequências
* **Positivas**: Consistência eventual garantida com semântica *at-least-once*, desacoplamento de latência e resiliência contra indisponibilidade de serviços externos.
