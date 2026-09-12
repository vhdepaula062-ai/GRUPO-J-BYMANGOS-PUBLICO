# Grupo J — Ecossistema Digital de Manutenção Automotiva

Plataforma multiempresa de manutenção e prevenção automotiva por assinatura recorrente.

---

## 1. Visão Geral da Arquitetura

O ecossistema é organizado em um monorepo orquestrado com **pnpm workspaces** e **Turborepo**:

* **`apps/admin-web`**: SaaS administrativo para o proprietário da plataforma gerenciar oficinas, motoristas, financeiro e configurações.
* **`apps/workshop-web`**: SaaS web e portal público para oficinas parceiras gerenciarem check-in, agenda, clientes vinculados e mensalidades.
* **`apps/customer-mobile`**: Aplicativo mobile nativo (Android e iOS) desenvolvido com Expo / React Native para motoristas resgatarem benefícios e acompanharem seus veículos.
* **`apps/api`**: Backend unificado com route handlers, health check, endpoints de domínio e webhooks de pagamento.
* **`packages/`**: 15 pacotes modulares contendo tipos, validações Zod, regras puras de domínio, segurança criptográfica, clientes de banco e design system.
* **`supabase/`**: Migrations SQL com Row Level Security (RLS) mandatória, sementes de desenvolvimento e testes automatizados.

---

## 2. Requisitos de Ambiente

* **Node.js**: `>= 20.0.0` (recomendado v20.x ou v24.x)
* **pnpm**: `>= 9.0.0` (v12.x suportada)
* **Git**
* **Docker Desktop** (opcional, para emulação local do Supabase via CLI)

---

## 3. Guia Rápido de Instalação e Execução

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd grupo-j

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Instalar dependências de todos os workspaces
pnpm install

# 4. Executar checagens de qualidade
pnpm lint
pnpm typecheck
pnpm test

# 5. Executar todos os serviços em desenvolvimento simultâneo
pnpm dev
```

### Portas Padrão em Desenvolvimento:
* **Admin Web**: [http://localhost:3000](http://localhost:3000)
* **Workshop Web**: [http://localhost:3001](http://localhost:3001)
* **API Central**: [http://localhost:3002](http://localhost:3002)
* **API Health Check**: [http://localhost:3002/api/health](http://localhost:3002/api/health)
* **Customer Mobile**: Metro Bundler via terminal (`npx expo start`)

---

## 4. Documentação Técnica

Consulte a documentação completa em `docs/`:
* [Contexto do Sistema](docs/SYSTEM_CONTEXT.md)
* [Arquitetura Técnica](docs/ARCHITECTURE.md)
* [Modelo de Domínio](docs/DOMAIN_MODEL.md)
* [Matriz de Permissões (RBAC)](docs/PERMISSIONS_MATRIX.md)
* [Classificação de Dados & LGPD](docs/DATA_CLASSIFICATION.md)
* [Modelo de Ameaças (STRIDE)](docs/THREAT_MODEL.md)
* [Contratos de API](docs/API_CONTRACT.md)
* [Conformidade com Lojas Mobile](docs/STORE_COMPLIANCE.md)
* [Decisões Pendentes de Produto](docs/DECISIONS_PENDING.md)
* [Design System & Tokens](docs/DESIGN_SYSTEM.md)
* [Registros de Decisão Arquitetural (ADRs)](docs/adr/)
