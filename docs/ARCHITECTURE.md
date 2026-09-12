# Arquitetura do Sistema — Ecossistema Digital Grupo J

## 1. Visão Geral da Arquitetura de Monorepo

O projeto adota uma arquitetura de monorepo estruturada sob **pnpm workspaces** e orquestrada pelo **Turborepo**, garantindo isolamento estrito de pacotes, compartilhamento de contratos, compilação incremental e independência entre plataformas.

```
grupo-j/
├── apps/
│   ├── admin-web/            # SaaS do Proprietário (Next.js App Router)
│   ├── workshop-web/         # Portal & SaaS das Oficinas (Next.js App Router)
│   ├── customer-mobile/      # App do Motorista (Expo SDK / React Native)
│   └── api/                  # Backend central / Route Handlers unificados
│
├── packages/
│   ├── api-client/           # Cliente HTTP fortemente tipado
│   ├── auth/                 # Provedor e helpers de sessão Supabase
│   ├── config/               # Validação de variáveis de ambiente com Zod
│   ├── database/             # Clientes Supabase (Server, Client, Admin)
│   ├── design-tokens/        # Tokens semânticos universais (cores, tipografia, espaçamento)
│   ├── domain/               # Entidades puras, Value Objects, invariantes e erros
│   ├── observability/        # Logs estruturados com redação de PII e métricas
│   ├── payments/             # Abstração PaymentGateway e adaptadores
│   ├── security/             # HMAC blind index para CPF, máscaras e sanitizadores
│   ├── test-utils/           # Fixtures e helpers de teste
│   ├── types/                # Contratos TypeScript de domínio, DTOs e DB
│   ├── ui-mobile/            # Componentes visuais para React Native
│   ├── ui-web/               # Componentes visuais para Next.js (Tailwind)
│   ├── validation/           # Schemas Zod unificados
│   ├── eslint-config/        # Configurações ESLint compartilhadas
│   └── typescript-config/    # Tsconfig bases compartilhadas
│
├── supabase/
│   ├── migrations/           # Migrations versionadas em SQL puro
│   ├── seed/                 # Seed sintético de desenvolvimento
│   ├── tests/                # Testes de isolamento RLS e integridade
│   └── config.toml           # Configuração de emulação local Supabase
```

---

## 2. Princípios Arquiteturais e Fronteiras de Responsabilidade

### 2.1 Separação Rígida entre Web e Mobile
* **O que é compartilhado**: Contratos TypeScript (`@grupo-j/types`), Schemas Zod (`@grupo-j/validation`), Regras de Domínio Puras (`@grupo-j/domain`), Tokens de Design (`@grupo-j/design-tokens`), Cliente de API (`@grupo-j/api-client`) e Segurança (`@grupo-j/security`).
* **O que NÃO é compartilhado**: Código de renderização de interface gráfica e bibliotecas nativas. O pacote `@grupo-j/ui-web` baseia-se em DOM/Tailwind/Radix, enquanto `@grupo-j/ui-mobile` baseia-se em React Native Primitives/StyleSheet. Essa separação evita o vazamento de dependências de Node ou DOM para o bundle mobile do Hermes e previne quebras de compilação.

### 2.2 Domínio Puro Desacoplado de Frameworks
O pacote `@grupo-j/domain` não importa React, Next.js, Expo ou Supabase. Ele contém:
* Entidades e Agregados com métodos de transição válidos.
* Value Objects com garantias de invariantes (ex.: `MonetaryAmount` em centavos, `Plate` formato Mercosul/antigo).
* Serviços de domínio (ex.: cálculo da data permitida para troca de oficina: `nextChangeAllowedAt = lastChangeDate + 30 days`).
* Erros de domínio tipados (`WorkshopChangeCooldownError`, `BenefitAlreadyRedeemedError`, `InvalidSubscriptionStatusError`).

---

## 3. Fluxo de Dados e Transações (Transactional Outbox)

```
[Cliente Web / Mobile]
          │ 1. Requisição com Idempotency-Key
          ▼
    [apps/api]
          │ 2. Autenticação & Validação Zod
          │ 3. Execução do Caso de Uso de Domínio
          ▼
[PostgreSQL Database (Transação Atômica)]
   ├── Tabela de Domínio (ex.: benefit_redemptions, payments)
   ├── Tabela de Auditoria (audit_logs - append-only)
   └── Tabela Outbox (outbox_events - payload JSONB)
          │
          ▼ 4. Transação consolidada (COMMIT)
[Supabase Realtime / Worker de Background]
          │ 5. Leitura de outbox_events não processados
          ├── Disparo de Webhook externo
          ├── Envio de Push Notification
          └── Atualização de cache via revalidação
```

1. Toda mutação financeira ou de benefício ocorre dentro de uma transação SQL atômica (`BEGIN ... COMMIT`).
2. Se a transação falhar, nenhum evento de notificação ou cobrança externa é emitido.
3. Se a transação tiver sucesso, o registro no `outbox_events` garante entrega confiável com semântica *at-least-once*.

---

## 4. Topologia de Implantação e Ambientes

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│   ├── admin.grupoj.com.br       -> apps/admin-web           │
│   ├── oficina.grupoj.com.br     -> apps/workshop-web        │
│   └── api.grupoj.com.br         -> apps/api                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / TLS 1.3
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                        │
│   ├── PostgreSQL 15+ com RLS                                │
│   ├── Auth Server (JWT, MFA TOTP)                           │
│   ├── Storage S3-compatible (evidências de serviços)        │
│   └── Realtime Server                                       │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │ HTTPS / TLS 1.3
┌──────────────────────────────┴──────────────────────────────┐
│                   EXPO APPLICATION SERVICES                 │
│   ├── Android (.aab / APK)  -> Google Play Store            │
│   └── iOS (.ipa)            -> Apple App Store / TestFlight │
└─────────────────────────────────────────────────────────────┘
```

### Ambientes Configurados:
1. **Local**: Docker com Supabase CLI local, servidores Next.js em localhost (`3000`, `3001`, `3002`), Expo Go / Emulador.
2. **Preview**: Deploys efêmeros por Pull Request na Vercel com banco de dados isolado para testes de integração.
3. **Staging / Homologação**: Ambiente idêntico à produção com credenciais de sandbox do gateway e versões preview de apps no TestFlight e Google Play Internal Testing.
4. **Production**: Ambiente de alta disponibilidade com backups diários automatizados, PITR (Point-in-Time Recovery), chaves restritas e RLS estrito.
