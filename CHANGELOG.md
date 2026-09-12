# Changelog — Ecossistema Digital Grupo J

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-09-12

### Adicionado
* Fundação arquitetural do monorepo com `pnpm` e `Turborepo`.
* Especificação e documentação técnica completa em `docs/` com 8 ADRs, contexto, domínio, permissões RBAC, classificação de dados, segurança STRIDE e conformidade com lojas móveis.
* Pacotes compartilhados em `packages/`: `types`, `domain`, `validation`, `security`, `payments`, `design-tokens`, `ui-web`, `ui-mobile`, `database`, `api-client`, `observability`, `config`, `test-utils`, `typescript-config`, `eslint-config`.
* Esquema relacional PostgreSQL com migrations, Row Level Security (RLS) e regras transacionais em `supabase/migrations/`.
* Aplicações funcionais executáveis:
  * `apps/admin-web`: SaaS para gestão do proprietário com rotas protegidas e empty states.
  * `apps/workshop-web`: Portal público institucional e SaaS exclusivo para oficinas parceiras.
  * `apps/customer-mobile`: Shell nativo multiplataforma Expo Router para motoristas.
  * `apps/api`: Backend central com health check e endpoints de contratos.
* Pipeline de Integração Contínua (CI) em `.github/workflows/ci.yml`.
