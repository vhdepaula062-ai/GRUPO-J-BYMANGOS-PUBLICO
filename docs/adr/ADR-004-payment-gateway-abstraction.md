# ADR-004: Abstração de Gateway de Pagamentos e Webhooks Idempotentes

## Status
Aprovado

## Contexto
O modelo de receita do Grupo J baseia-se em cobrança recorrente de R$ 50/mês para motoristas e R$ 500/mês para oficinas parceiras. A definição do fornecedor final de adquirência (Mercado Pago, Asaas, Iugu, Pagar.me) está em fase de cotação comercial pelo proprietário. O código não pode ficar bloqueado nem acoplado diretamente a um SDK de terceiros.

## Decisão
Implementar o padrão de projeto *Port & Adapter* (Arquitetura Hexagonal) no pacote `@grupo-j/payments`:
1. Definir a interface `PaymentGateway` com operações essenciais: `createCustomer`, `createSubscription`, `getSubscription`, `cancelSubscription`, `updatePaymentMethod`, `createDiscount`, `createRefund`, `verifyWebhook` e `normalizeEvent`.
2. Criar o `FakePaymentGateway` para execução de testes automatizados e desenvolvimento local, bloqueado por código para impedir carregamento em produção.
3. Criar a casca do adaptador `MercadoPagoPaymentGateway` pronta para receber credenciais oficiais de produção.
4. Processar webhooks de forma idempotente registrando a assinatura HMAC e o identificador do evento em `idempotency_keys`.

## Consequências
* **Positivas**: Troca de gateway transparente sem impacto nas entidades de domínio ou controllers, proteção contra cobrança duplicada e simulação confiável em testes.
