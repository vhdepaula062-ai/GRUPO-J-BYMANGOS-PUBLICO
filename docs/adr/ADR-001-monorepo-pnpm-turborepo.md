# ADR-001: Adoção de Monorepo com pnpm Workspaces e Turborepo

## Status
Aprovado

## Contexto
O ecossistema digital do Grupo J contempla múltiplos pontos de contato: dois portais web (Administrativo e Oficinas), um aplicativo mobile nativo multiplataforma (iOS e Android), uma API backend central e inúmeras regras de negócio compartilhadas (cálculo de carência de 30 dias, tipos de dados, schemas Zod, tokens visuais). Manter repositórios separados provocaria duplicação de regras, dessincronização de contratos de API e sobrecarga na gestão de versões.

## Decisão
Adotar uma arquitetura de monorepo utilizando **pnpm workspaces** para gerenciamento eficiente e determinístico de dependências via symlinks/hardlinks, orquestrado pelo **Turborepo** para execução paralela de tarefas de build, lint, typecheck e testes com cache inteligente.

## Consequências
* **Positivas**: Fonte única de verdade para tipos e validações, versionamento atômico, facilidade em refatorações entre backend e frontends, pipelines de CI unificadas e builds incrementais ultrarrápidos.
* **Mitigações**: Manter disciplina no isolamento de pacotes para evitar dependências circulares e não importar pacotes web (`@grupo-j/ui-web`) dentro do ambiente mobile (`customer-mobile`).
