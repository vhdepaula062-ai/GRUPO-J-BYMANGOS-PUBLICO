# Registro de Migração Visual — SaaS Web Grupo J

## 1. Contexto e Objetivos da Migração

A migração visual teve como objetivo elevar o padrão estético dos dois produtos web do ecossistema Grupo J ao nível dos materiais de referência da marca (`Designref/`), criando uma experiência executiva de alta confiança para parceiros credenciados e administradores.

A migração seguiu três diretrizes invioláveis:
1. **Isolamento Absoluto do Mobile**: O aplicativo móvel do cliente (`apps/customer-mobile`) e seu pacote de componentes nativos (`packages/ui-mobile`) não foram tocados, mantendo 100% de integridade em código, navegação e compilação nativa Expo.
2. **Encapsulamento por Tema CSS**: Todas as regras visuais foram escopadas ao atributo `[data-ui-theme="grupo-j-saas"]`, impedindo qualquer vazamento de estilos globais no monorepo.
3. **Preservação Rígida das Regras de Negócio**: Nenhuma regra de domínio foi alterada ou simplificada. Valores monetários permaneceram em centavos inteiros (`5000` para motoristas, `50000` para oficinas), janelas de validação de voucher mantidas em 120 segundos, trava de 30 dias para troca de oficina e mascaramento LGPD de CPF via Blind Index HMAC-SHA256.

---

## 2. Mapa de Rotas e Telas Migradas

### 2.1 Portal e SaaS Operacional da Oficina (`apps/workshop-web`)

| Rota | Tipo | Descrição da Interface e Mudanças Visuais |
| :--- | :--- | :--- |
| `/` | Pública | **Landing Page Institucional Oficial** inspirada em `desgnref(8), (9), (10), (11), (13), (14)`. Hero section com pill "Prevenção Veicular por Assinatura", headline de alto impacto, linha de números de destaque (R$ 50/mês, 4 serviços essenciais, 100% preventivo), fluxo visual em 4 passos numerados com cards elevados, seção exclusiva para centros automotivos em azul-marinho profundo (`#00091D`) com a mensalidade corrigida para R$ 500,00/mês e depoimento do fundador ("Jotinha"). |
| `/seja-parceiro` | Pública | **Formulário de Credenciamento** fiel a `desgnref(12)`. Card branco elevado em fundo suave, campos com anéis de foco azuis, badges de benefícios garantidos (demanda recorrente, pagamento garantido, suporte) e confirmação visual de envio. |
| `/login` | Autenticação | Tela de login do parceiro credenciado com logotipo oficial versão escura sobre fundo claro suave, campos seguros de e-mail e senha com alternador visual de visibilidade (Eye/EyeOff). |
| `/mfa` | Autenticação | Tela de validação de segundo fator (TOTP) com código de 6 dígitos em tipografia monoespaçada, instruções claras e layout centralizado. |
| `/painel` | SaaS Operacional | Dashboard da oficina com 4 `KpiCard`s (Vouchers Validados Hoje, Faturamento Acumulado, Carros Atendidos no Mês, Avaliação Média da Unidade), banner com botão de acesso rápido para validação de voucher em até 120 segundos, e tabela recente com `StatusBadge` semântico. |
| `/check-in` | Operação Crítica | Validador de voucher com alerta visual do limite de 120 segundos, campos destacados para código e placa do veículo, feedback de elegibilidade com chip verde e botão de abertura imediata de Ordem de Serviço. |
| `/clientes` | Operação | Gestão da carteira de motoristas vinculados à oficina, com `FilterBar` para busca rápida por placa ou nome, e `DataTable` paginada exibindo plano, data de vinculação e status da assinatura. |
| `/mensalidade` | Financeiro B2B | Gestão da assinatura corporativa da oficina (R$ 500,00/mês). Card com status "Em dia", próximo vencimento, histórico de faturas com download de recibo e dados fiscais de emissão. |

### 2.2 SaaS Administrativo e Governança (`apps/admin-web`)

| Rota | Tipo | Descrição da Interface e Mudanças Visuais |
| :--- | :--- | :--- |
| `/login` | Autenticação | Login executivo do proprietário (Joaquim) em fundo claro corporativo, logotipo oficial `GESTÃO & GOVERNANÇA`, campos seguros e aviso de conformidade LGPD. |
| `/mfa` | Autenticação | Confirmação de autenticação multifator obrigatória para administradores de plataforma. |
| `/dashboard` | Executivo | Painel de controle da rede com KPIs consolidados (MRR Total R$ 89.400,00, Motoristas Ativos, Oficinas Credenciadas, Vouchers Validados no Mês), gráfico e status de conformidade da rede, além de fila de moderação de ofertas com ações de Aprovar/Rejeitar. |
| `/clientes` | Governança / LGPD | Gestão da base de motoristas com `FilterBar` avançada, `DataTable` exibindo CPF mascarado (`***.***.123-**`), hash do Blind Index HMAC-SHA256, plano de R$ 50,00/mês e status de assinatura. |
| `/oficinas` | Credenciamento | Gestão de centros automotivos credenciados na rede, visualização da mensalidade B2B de R$ 500,00/mês, status operacional (`Homologada`, `Em análise`, `Suspensa`) e indicador de capacidade de atendimento. |

---

## 3. Arquitetura de Componentes e Arquivos Alterados

### 3.1 Novo Pacote Centralizado: `packages/ui-web`
* `src/theme/tokens.ts`: Tokens tipados de cores, espaçamentos, raios e sombras.
* `src/theme/typography.ts`: Escala tipográfica padronizada com Inter.
* `src/theme/grupo-j-saas.css`: Folha de estilos CSS escopada em `[data-ui-theme="grupo-j-saas"]`.
* `src/icons/GrupoJSymbol.tsx`: Distintivo oficial chanfrado com monograma "J" vazado.
* `src/icons/GrupoJLogo.tsx`: Logotipo da marca com variantes `light`/`dark` e subtítulos dinâmicos.
* `src/icons/icons.tsx`: Re-exportação de ícones Lucide essenciais.
* `src/components/*`: 16 componentes de interface acessíveis e responsivos.
* `src/layouts/*`: Shell corporativo, sidebars escuras `#00091D`, topbars brancas e banner break-glass.
* `src/patterns/*`: Barra de filtros, grade de métricas e seções de formulário.

### 3.2 Aplicação `apps/workshop-web`
* `src/app/layout.tsx`: Inclusão da fonte Inter e atributo `data-ui-theme="grupo-j-saas"`.
* `src/app/globals.css`: Importação dos estilos do tema `@grupo-j/ui-web`.
* `src/app/page.tsx`: Redesenho total da landing page institucional.
* `src/app/seja-parceiro/page.tsx`: Redesenho do formulário de credenciamento.
* `src/app/(auth)/login/page.tsx`: Redesenho do login de oficinas.
* `src/app/(auth)/mfa/page.tsx`: Redesenho da tela de MFA.
* `src/components/WorkshopSidebar.tsx`: Sidebar em Navy `#00091D` com logo oficial e ícones Lucide.
* `src/components/WorkshopNavbar.tsx`: Topbar com atalho de validação rápida e logout.
* `src/app/(portal)/painel/page.tsx`: Dashboard operacional refatorado com KpiCards.
* `src/app/(portal)/check-in/page.tsx`: Validador de voucher com timer de 120s e feedback visual.
* `src/app/(portal)/clientes/page.tsx`: Tabela de clientes com FilterBar.
* `src/app/(portal)/mensalidade/page.tsx`: Gestão de faturamento B2B de R$ 500,00/mês.

### 3.3 Aplicação `apps/admin-web`
* `src/app/layout.tsx`: Inclusão da fonte Inter e atributo `data-ui-theme="grupo-j-saas"`.
* `src/app/globals.css`: Importação dos estilos do tema `@grupo-j/ui-web`.
* `src/app/login/page.tsx`: Login executivo corporativo em fundo claro com logo oficial.
* `src/app/mfa/page.tsx`: Tela de MFA com código TOTP.
* `src/components/AdminSidebar.tsx`: Sidebar executiva em Navy `#00091D` com logo oficial e navegação corporativa.
* `src/components/AdminNavbar.tsx`: Topbar com indicador de rede homologada e notificações.
* `src/app/(dashboard)/dashboard/page.tsx`: Painel consolidado com KPIs, moderação e governança.
* `src/app/(dashboard)/clientes/page.tsx`: Gestão de motoristas com mascaramento LGPD e Blind Index.
* `src/app/(dashboard)/oficinas/page.tsx`: Gestão de centros credenciados e faturamento B2B.

---

## 4. Auditoria de Isolamento Mobile

Conforme verificado pelo comando de auditoria Git:
* `apps/customer-mobile/`: **0 arquivos alterados**.
* `packages/ui-mobile/`: **0 arquivos alterados**.
* Os pacotes de UI permanecem estritamente separados:
  - `@grupo-j/ui-web` é consumido apenas por `admin-web` e `workshop-web`.
  - `@grupo-j/ui-mobile` é consumido exclusivamente por `customer-mobile`.
