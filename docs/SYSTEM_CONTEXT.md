# Contexto do Sistema — Ecossistema Digital Grupo J

## 1. Problema de Negócio

O setor automotivo brasileiro de manutenção preventiva sofre com:
* **Falta de previsibilidade financeira para o motorista**: Gastos não planejados com oficinas mecânicas geram inadimplência, adiamento de revisões e degradação da frota particular.
* **Incerteza de faturamento para centros automotivos**: Oficinas dependem de demanda reativa (quando o veículo já quebrou), com alta ociosidade de mão de obra em determinados períodos do mês.
* **Desconfiança mútua**: Dificuldade de auditoria dos serviços realmente prestados e ausência de histórico centralizado de manutenções por placa de veículo.

O **Grupo J** soluciona essa dor através de um modelo de **assinatura recorrente** bilateral:
1. Motoristas assinam um plano mensal de baixo custo para usufruir de serviços preventivos garantidos em uma oficina de confiança.
2. Oficinas parceiras pagam uma mensalidade para integrar a rede credenciada do Grupo J, recebendo um fluxo constante de clientes fidelizados e receita previsível.

---

## 2. Atores do Sistema e Hierarquia

```
┌─────────────────────────────────────────────────────────────┐
│                           MANGOS                            │
│  (Engenharia de Software, Sustentação Técnica & Break-Glass) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROPRIETÁRIO DO GRUPO J                  │
│       (Gestor Operacional, Financeiro e de Negócios)        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│       OFICINAS PARCEIRAS     ││     MOTORISTAS ASSINANTES    │
│  (SaaS Web B2B - R$ 500/mês) ││ (App Mobile B2C - R$ 50/mês) │
└──────────────────────────────┘└──────────────────────────────┘
```

### 2.1 Mangos
* **Papel**: Desenvolvedora de software e mantenedora técnica da infraestrutura.
* **Acesso**: Acesso operacional zero na rotina comercial. Mecanismo exclusivo de *break-glass* (`mangos_support`) ativado apenas sob requisição formal, com MFA obrigatório, banner de advertência visual em tempo real, expiração automática (TTL máx. 2 horas) e auditoria criptográfica de todos os comandos executados.

### 2.2 Proprietário da Plataforma (Grupo J)
* **Papel**: Administrador do negócio, operando via `admin-web`.
* **Atribuições**: Cadastrar e homologar oficinas parceiras, gerenciar planos de assinatura, moderar e aprovar promoções criadas pelas oficinas, conceder isenções e descontos justificados, gerenciar permissões administrativas e supervisionar a conformidade LGPD.
* **Restrições de Segurança**: O proprietário **não possui acesso** a senhas em texto plano, dados de cartão de crédito (PAN/CVV), chaves secretas de infraestrutura ou tokens de sessão.

### 2.3 Oficinas Parceiras (Auto Centers)
* **Papel**: Prestadoras de serviços de manutenção preventiva cadastradas no ecossistema, operando via `workshop-web`.
* **Mensalidade**: R$ 500,00 por mês (`50000` centavos).
* **Atribuições**: Validar benefícios de clientes vinculados via QR Code ou identificação segura, realizar check-in do veículo, registrar evidências de serviços executados, criar promoções locais para moderação e gerenciar seus mecânicos/atendentes.
* **Isolamento de Dados**: Estritamente confinadas aos seus próprios dados de organização (`organization_id`). Uma oficina jamais visualiza o faturamento, clientes ou atendimentos de outra oficina.

### 2.4 Motoristas (Clientes Finais)
* **Papel**: Proprietários de veículos que contratam a assinatura mensal, operando via `customer-mobile` (iOS/Android).
* **Mensalidade**: R$ 50,00 por mês (`5000` centavos).
* **Atribuições**: Escolher e vincular-se a uma oficina parceira (com trava mínima de 30 dias para troca), acompanhar ciclo de benefícios vigentes, apresentar QR Code para resgate preventivo, consultar promoções ativas e gerenciar veículos cadastrados.

---

## 3. Produtos do Ecossistema

| Produto | Identificador | Stack Tecnológica | Usuário Primário |
| :--- | :--- | :--- | :--- |
| **SaaS Administrativo** | `apps/admin-web` | Next.js 14+ (App Router), Tailwind CSS, TypeScript | Proprietário do Grupo J e administradores |
| **Portal & SaaS Oficinas** | `apps/workshop-web` | Next.js 14+ (App Router), Tailwind CSS, TypeScript | Donos de oficina, gerentes, atendentes, mecânicos |
| **Aplicativo do Motorista** | `apps/customer-mobile`| Expo SDK / React Native, Expo Router, TypeScript | Motoristas e clientes finais (iOS / Android) |
| **Backend Central** | `apps/api` | Next.js Route Handlers / Edge & Node runtime, TypeScript | Comunicação autenticada de todas as pontas |

---

## 4. Limites do Sistema e Integrações Externas

```
                            ┌───────────────────────────────────┐
                            │      Provedor de Autenticação     │
                            │          (Supabase Auth)          │
                            └─────────────────▲─────────────────┘
                                              │ JWT / MFA
                                              │
┌─────────────────────────┐          ┌────────┴────────┐          ┌─────────────────────────┐
│     Gateway de Pago     │ Webhook  │                 │  Push    │  Serviço de Notificação │
│ (Mercado Pago / Abstr.) ├─────────►│  ECOSSISTEMA    ├─────────►│     (Expo Push API)     │
│                         │◄─────────┤     GRUPO J     │          │                         │
└─────────────────────────┘  API Rest│                 │          └─────────────────────────┘
                                     └────────┬────────┘
                                              │ SQL / RLS
                                              ▼
                            ┌───────────────────────────────────┐
                            │    Banco de Dados Centralizado    │
                            │       (PostgreSQL / Supabase)     │
                            └───────────────────────────────────┘
```

1. **Gateway de Pagamento**:
   - Processamento de cobrança recorrente com tokenização segura de cartão de crédito.
   - Emissão de faturas, links Pix e cartões.
   - Recepção de eventos assíncronos via webhooks idempotentes assinados por chave HMAC.
   - O ecossistema nunca armazena dados de cartão (PAN, CVV).
2. **Autenticação e Identidade**:
   - Supabase Auth com suporte a MFA (TOTP), sessões curtas e renovação transparente via refresh token seguro.
3. **Serviço de Notificações**:
   - Disparo de push notifications operacionais (confirmação de agendamento, vencimento de ciclo de benefício, alerta de pagamento pendente).

---

## 5. Responsabilidades Inegociáveis

1. **Fonte Única de Verdade**: Uma única base PostgreSQL centralizada. Não existem três bancos de dados separados para admin, oficina e mobile.
2. **Idempotência Financeira**: Toda transação de cobrança, isenção ou reembolso exige chave de idempotência (`idempotency_keys`) e registro em tabela de eventos imutáveis.
3. **Imutabilidade Histórica**: Registros de pagamentos, cobranças, auditoria e logs de resgate de benefícios nunca podem ser apagados via `DELETE` ou alterados retroativamente.
4. **Isolamento Multiempresa por Hardware Lógico**: As restrições de tenant são aplicadas no banco de dados via Row-Level Security (RLS) e verificadas na API, nunca dependendo de filtros de interface gráfica.
