# Design System SaaS Grupo J — Especificação Visual Web

## 1. Visão Geral e Delimitação de Escopo

O **Design System SaaS Grupo J** foi desenvolvido para materializar a identidade visual oficial da marca aprovada nas referências visuais institucionais (`Designref/desgnref(1).jpeg` a `(14).jpeg`).

> [!IMPORTANT]
> **Isolamento de Plataforma**: Esta especificação visual aplica-se **exclusivamente aos produtos web**:
> 1. `apps/workshop-web`: Portal público da marca, página de credenciamento e SaaS operacional das oficinas credenciadas.
> 2. `apps/admin-web`: SaaS de gestão e governança corporativa do proprietário (Joaquim).
> 
> O aplicativo móvel do motorista (`apps/customer-mobile`) e seu pacote de UI nativo (`packages/ui-mobile`) permanecem estritamente isolados em conformidade com as diretrizes de publicação e design móvel nativo.

Todo o tema visual web é encapsulado através do pacote `@grupo-j/ui-web` e ativado pelo seletor CSS `[data-ui-theme="grupo-j-saas"]`.

---

## 2. Identidade Visual da Marca (Brand Assets)

A identidade visual reflete sofisticação técnica, precisão e solidez para o mercado automotivo brasileiro.

### 2.1 O Símbolo Oficial ("ESSE")
Identificado nas referências `desgnref(2)`, `desgnref(4)` e `desgnref(7)`:
* **Forma**: Distintivo geométrico vertical com chanfro angular no canto superior esquerdo (45°), em corte de precisão mecânica.
* **Monograma**: Letra estilizada **"J"** vazada em corte central, com curvatura inferior harmônica.
* **Cor**: Azul Elétrico Institucional (`#034EFE`) ou Azul-Marinho Profundo (`#00091D`).
* **Componente**: `<GrupoJSymbol size={36} variant="primary" />` (vetor SVG puro em `packages/ui-web/src/icons/GrupoJSymbol.tsx`).

### 2.2 O Logotipo Completo
* **Lettering**: Tipografia geométrica condensada em caixa alta com peso pesado (`font-black tracking-tight`): **GRUPO J**.
* **Subtítulo Semântico**: Tipografia limpa e espaçada (`tracking-widest uppercase`):
  * `AUTO CENTER` (para oficinas e landing page)
  * `GESTÃO & GOVERNANÇA` (para administração central)
  * `PORTAL DO PARCEIRO` (para login de parceiros credenciados)
* **Variantes**:
  * `light`: Para aplicação sobre fundos escuros (Deep Navy `#00091D`), com texto em branco puro e subtítulo em azul suave.
  * `dark`: Para aplicação sobre fundos claros (`#FFFFFF` ou `#F8FAFC`), com texto em navy profundo e subtítulo em cinza chumbo.
* **Componente**: `<GrupoJLogo variant="light" size="md" subtitle="GESTÃO & GOVERNANÇA" />`.

---

## 3. Tokens Semânticos de Cor (`packages/ui-web/src/theme/tokens.ts`)

| Token | Hex / Valor | Função e Aplicação Semântica |
| :--- | :--- | :--- |
| `brand.primary` | `#034EFE` | Azul elétrico vibrante oficial da marca. Utilizado em botões primários, CTAs, links ativos e ícones de destaque. |
| `brand.primaryHover`| `#023ECC` | Estado hover/active para elementos de marca primários. |
| `brand.primarySubtle`| `#EEF4FF` | Fundo de destaque leve para tags selecionadas, pills e linhas ativas. |
| `brand.navy` | `#00091D` | Azul-marinho profundo quase negro. Utilizado em sidebars, headers institucionais, cards executivos de contraste e títulos de alto nível. |
| `brand.navySurface` | `#0B1528` | Superfície secundária em painéis escuros (hover de menu lateral, cards internos). |
| `surface.default` | `#FFFFFF` | Branco puro para cartões, modais, formulários e dropdowns. |
| `surface.subtle` | `#F8FAFC` | Fundo geral das aplicações web (canvas neutro suave). |
| `surface.muted` | `#F1F5F9` | Cinza muito claro para backgrounds secundários, skeletons e cabeçalhos de tabela. |
| `text.primary` | `#0F172A` | Preto azulado de altíssimo contraste para textos principais e títulos (WCAG AAA). |
| `text.secondary` | `#475569` | Cinza médio para textos de suporte, metadados e legendas. |
| `text.muted` | `#94A3B8` | Cinza neutro claro para placeholders e estados desabilitados. |
| `text.inverse` | `#FFFFFF` | Branco puro para textos sobre fundos escuros ou botões primários. |
| `status.success` | `#10B981` | Verde esmeralda para vouchers validados, faturas pagas e entidades ativas. |
| `status.warning` | `#F59E0B` | Âmbar para pendências cadastrais, carência ativa de 30 dias e avisos. |
| `status.danger` | `#EF4444` | Vermelho para inadimplência, vouchers expirados e erros críticos. |
| `status.info` | `#034EFE` | Azul informativo para dicas operacionais e orientações do sistema. |
| `border.default` | `#E2E8F0` | Linha de contorno padrão para cards, inputs e tabelas. |
| `border.focus` | `#034EFE` | Anel de foco com 2px de espessura para conformidade WCAG 2.2 com teclado. |

---

## 4. Tipografia e Espaçamento

* **Família Tipográfica**: `Inter, system-ui, -apple-system, sans-serif` carregada via `next/font/google` com suporte aos pesos 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold) e 900 (Black).
* **Escala de Tamanhos**:
  * `xs`: 12px (line-height 16px) — Badges, legendas e rótulos de status.
  * `sm`: 14px (line-height 20px) — Texto secundário, inputs, botões compactos e tabelas.
  * `base`: 16px (line-height 24px) — Corpo de texto padrão, botões principais e inputs.
  * `lg`: 18px (line-height 28px) — Subtítulos de seções e modais.
  * `xl`: 20px (line-height 28px) — Títulos de cartões e valores numéricos em KPIs.
  * `2xl`: 24px (line-height 32px) — Títulos de páginas e cabeçalhos intermediários.
  * `3xl`: 30px (line-height 36px) — Títulos principais de dashboards.
  * `4xl`: 36px (line-height 40px) — Títulos de seções de landing page.
  * `5xl`: 48px (line-height 1.1) — Hero title da landing page pública.
* **Raios de Curvatura (Radii)**:
  * `rounded-lg`: 8px para botões, inputs e badges.
  * `rounded-xl`: 12px para cartões operacionais e tabelas.
  * `rounded-2xl`: 16px para cartões executivos e modais.
  * `rounded-3xl`: 24px para seções heróicas e cards promocionais da landing page.
  * `rounded-full`: 9999px para avatares e pills numéricos.

---

## 5. Catálogo de Componentes (`packages/ui-web/src/components`)

1. **`Button` & `IconButton`**:
   * Variantes: `primary` (azul elétrico), `secondary` (borda e fundo sutil), `outline` (apenas contorno), `ghost` (sem fundo), `danger` (ações críticas de exclusão/suspensão).
   * Suporte nativo a indicador de carregamento (`isLoading`) e ícones de início/fim.
2. **`Input`, `PasswordInput` & `SearchInput`**:
   * Contorno sutil com anel de foco visível (`focus:ring-2 focus:ring-[#034EFE]`).
   * `PasswordInput`: Botão integrado com alternador visual (Eye / EyeOff) acessível via teclado.
   * `SearchInput`: Ícone de lupa integrado e botão de limpeza rápida de texto.
3. **`Select`**:
   * Campo de seleção padronizado com seta personalizada e suporte a texto auxiliar/erro.
4. **`Card` & `KpiCard`**:
   * Superfície branca elevada com sombra suave (`0 1px 3px rgba(0,0,0,0.06)`).
   * `KpiCard`: Exibição de valor grande formatado, rótulo, ícone semântico com cor de acento e badge de variação percentual ou contexto operacional.
5. **`Badge` & `StatusBadge`**:
   * Mapeamento semântico automático para status: `active`, `pending`, `suspended`, `cancelled`, `validated`, `expired`.
   * Inclui ponto colorido indicador (status dot) e texto em caixa alta/capitalizada legível.
6. **`Avatar`**:
   * Suporte a imagem com fallback elegante para iniciais do usuário com cores de marca.
7. **`DataTable` & `Pagination`**:
   * Cabeçalho fixo com contraste sutil, linhas zebradas com hover suave, suporte a estados de carregamento via `Skeleton` e estado vazio integrado.
8. **`Modal` & `ConfirmationDialog`**:
   * Camada backdrop com desfoque de fundo (`backdrop-blur-sm`), trava de foco e acessibilidade com Escape e fechamento por clique fora.
9. **`Alert`**:
   * Notificações contextuais em 4 variantes: `info`, `success`, `warning` e `danger`.
10. **`Tabs`**:
    * Navegação horizontal entre abas com indicador de linha ativa na cor azul elétrico da marca.

---

## 6. Layouts e Padrões Estruturais (`packages/ui-web/src/layouts` e `patterns`)

1. **`SaaSSidebar`**:
   * Azul-marinho profundo (`#00091D`), com logotipo oficial, navegação com ícones e rótulos de alta legibilidade, indicador de ambiente (Dev/Staging/Prod) e rodapé com perfil resumido do operador.
2. **`SaaSTopbar`**:
   * Superfície branca limpa com barra de pesquisa global, sino de notificações com contagem de alertas não lidos e menu de usuário com logout rápido.
3. **`BreakGlassBanner`**:
   * Banner de alerta visual vermelho-vivo no topo da aplicação quando o modo de acesso de emergência corporativo ("Break-Glass") estiver ativo, garantindo transparência e auditoria.
4. **`FilterBar`**:
   * Padrão composto com campo de busca, seletores de filtro dinâmicos e botões de ação primária alinhados à direita.
5. **`MetricGrid`**:
   * Grade responsiva em 1, 2 ou 4 colunas para organização harmoniosa de indicadores-chave.
6. **`FormSection`**:
   * Agrupamento visual de campos com título, subtítulo explicativo e divisor sutil.
