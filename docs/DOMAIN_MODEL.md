# Modelo de Domínio — Ecossistema Digital Grupo J

## 1. Módulos de Domínio (Bounded Contexts)

O ecossistema é particionado em 18 módulos conceituais estritamente delimitados:

1. **Identity and Access**: Perfis de usuário, papéis granulares, sessões com MFA e break-glass.
2. **Organizations**: Entidades corporativas (Oficinas e Matriz), unidades filiais e membros vinculados.
3. **Workshops**: Perfis públicos das oficinas, especialidades, horários de atendimento e fotos/evidências.
4. **Customers**: Dados cadastrais de motoristas, canais de contato e endereços.
5. **Vehicles**: Frota de veículos vinculada a motoristas, placas e histórico de propriedade.
6. **Plans**: Catálogo versionado de planos e preços (ex.: R$ 50/mês para motoristas, R$ 500/mês para oficinas).
7. **Subscriptions**: Ciclo de vida da assinatura, renovações, status e histórico.
8. **Billing**: Transações de pagamento, faturas, estornos, contestações e idempotência.
9. **Discounts and Waivers**: Isenções e abatimentos concedidos com auditoria e vigência.
10. **Benefits**: Catálogo de benefícios preventivos associados a planos.
11. **Entitlements**: Direitos de uso vigentes por cliente dentro de um ciclo mensal ou anual.
12. **Appointments**: Agendamentos de serviços nas oficinas parceiras.
13. **Visits**: Registro físico de presença do veículo na oficina parceira.
14. **Redemptions**: Transações de consumo e validação de benefícios com fotos de evidência.
15. **Workshop Assignments**: Vinculação entre motorista e oficina parceira (com regra de trava de 30 dias).
16. **Promotions**: Campanhas promocionais criadas por oficinas e moderadas pela matriz.
17. **Notifications**: Preferências e envio de alertas operacionais por push/e-mail.
18. **Remote Configuration**: Parâmetros de negócio dinâmicos com histórico, rascunho e rollback.

---

## 2. Entidades Principais e Invariantes de Negócio

### 2.1 Subscription (Assinatura)
* **Invariantes**:
  - Valores monetários são expressos exclusivamente em centavos de Real (`amount_cents > 0`, ex.: `5000` ou `50000`).
  - O status financeiro é derivado estritamente de eventos confirmados do Gateway via Webhook.
  - A interface gráfica **nunca** marca uma assinatura como ativa por conta própria.
* **Máquina de Estados**:
```
┌────────┐     Pagamento Aprovado     ┌────────┐
│ PENDING├───────────────────────────►│ ACTIVE │
└───┬────┘                            └───┬────┘
    │                                     │ Falha na Renovação
    │ Expiração do Prazo                  ▼
    │                               ┌───────────┐
    │                               │ PAST_DUE  │
    │                               └─────┬─────┘
    │                                     │ Inadimplência Persistente
    ▼                                     ▼
┌────────┐     Cancelamento Solicitado┌───────────┐
│ FAILED │◄───────────────────────────┤ CANCELED  │
└────────┘                            └───────────┘
```

### 2.2 Workshop Assignment (Vinculação de Oficina)
* **Regra Inegociável dos 30 Dias**:
  - O motorista escolhe uma única oficina parceira como sua referência.
  - O campo `next_change_allowed_at` é calculado no momento da escolha: `assigned_at + INTERVAL '30 days'`.
  - Tentativas de troca onde `CURRENT_TIMESTAMP < next_change_allowed_at` são sumariamente rejeitadas com `WorkshopChangeCooldownError`.
  - Esta validação é imposta em 3 níveis:
    1. **Entidade de Domínio**: `WorkshopAssignment.canChangeAt(now)`
    2. **Caso de Uso / API**: Verificação prévia antes da mutação.
    3. **Banco de Dados**: Trigger SQL com `RAISE EXCEPTION` caso a regra seja violada.

### 2.3 Benefit Redemption (Resgate de Benefício)
* **Invariantes**:
  - Um benefício só pode ser resgatado se:
    1. A assinatura do motorista estiver estritamente com status `ACTIVE`.
    2. O motorista estiver vinculado à oficina onde o resgate ocorre (ou se a oficina for a matriz/autorizada).
    3. O saldo de direito (`entitlement.available_quantity > 0`) para o ciclo vigente for suficiente.
    4. O período de carência (`grace_period_days`) do plano tiver sido cumprido.
    5. O veículo cadastrado coincidir com o veículo em atendimento.
  - O resgate é atomicamente idempotente e gera um registro imutável em `benefit_redemptions`.

---

## 3. Eventos de Domínio do Ecossistema

| Evento de Domínio | Disparado Quando | Consumidores |
| :--- | :--- | :--- |
| `SubscriptionCreated` | Nova assinatura cadastrada | Módulo de Billing, Analytics |
| `SubscriptionActivated` | Pagamento confirmado pelo gateway | Entitlements (cria saldo de benefícios), Push Notifications |
| `SubscriptionSuspended` | Falha de cobrança confirmada | Entitlements (bloqueia resgates), App Mobile |
| `WorkshopAssigned` | Motorista seleciona oficina | Oficina parceira (notificação), Auditoria |
| `WorkshopChangeRequested`| Motorista solicita troca de oficina | Validador de 30 dias |
| `BenefitRedeemed` | Oficina valida resgate de serviço | Motorista (comprovante push), Histórico do Veículo |
| `PromotionSubmitted` | Oficina cria nova promoção | Fila de Moderação do Proprietário |
| `PromotionApproved` | Proprietário aprova promoção | Feed de Promoções do App Mobile |
| `WaiverGranted` | Proprietário concede isenção manual | Auditoria, Billing |
