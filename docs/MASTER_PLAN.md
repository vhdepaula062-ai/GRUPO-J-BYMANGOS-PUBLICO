# Master Plan de Evolução — Ecossistema Digital Grupo J

## 1. Visão Geral das Ondas de Desenvolvimento

A construção do ecossistema é dividida em 5 fases sequenciais rigorosamente delimitadas para entrega contínua de valor com estabilidade arquitetural:

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: FUNDAÇÃO ARQUITETURAL & MONOREPO (Execução Atual)    │
│  - Monorepo pnpm + Turbo, Banco de Dados, RLS, Contratos,   │
│    Design System unificado, Shells navegáveis e CI/CD.      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 2: IDENTIDADE, OFICINAS & CATÁLOGO DE PLANOS           │
│  - Onboarding e credenciamento de oficinas parceiras.       │
│  - Catálogo de benefícios e cadastro de frotas/veículos.    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 3: MOTOR DE ASSINATURAS & CHECK-IN COM QR CODE         │
│  - Integração oficial com Gateway de Pagamentos e Webhooks. │
│  - Check-in físico na oficina, validação de voucher e RLS.  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 4: OPERAÇÃO AVANÇADA, PROMOÇÕES & CONFIGURAÇÃO REMOTA  │
│  - Fila de moderação de promoções pelo proprietário.        │
│  - Concessão de isenções e descontos auditados.             │
│  - Publicação de configurações remotas versionadas.         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE 5: PREPARAÇÃO DE LANÇAMENTO & HOMOLOGAÇÃO NAS LOJAS    │
│  - TestFlight, Google Play Internal Testing, Pentest e DPO. │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Critérios de Não-Regressão
1. Cada nova funcionalidade deve ser suportada por testes unitários e de integração no pacote `@grupo-j/domain` e `@grupo-j/validation`.
2. Nenhuma migration SQL futura pode realizar `DROP COLUMN` ou alterações destrutivas sem plano de compatibilidade de leitura/escrita dupla.
3. As políticas de RLS no PostgreSQL devem ser continuamente expandidas e testadas via pgTAP para impedir vazamento entre oficinas parceiras.
