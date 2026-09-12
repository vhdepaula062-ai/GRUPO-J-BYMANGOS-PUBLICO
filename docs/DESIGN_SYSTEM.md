# Design System Grupo J — Diretrizes Visuais e Tokens

## 1. Filosofia de Design

A identidade visual do Grupo J comunica:
* **Solidez e Confiança**: Um ecossistema de manutenção automotiva profissional que cuida do patrimônio e segurança da família.
* **Modernidade e Clareza**: Interfaces limpas, de alta legibilidade, com contraste acessível (WCAG AA/AAA).
* **Usabilidade Direta**: Pensada para motoristas em situações cotidianas e atendentes de oficina com alta rotatividade operacional. Alvos de toque generosos (mínimo 44x44pt) e ausência de excessos visuais (sem efeito neon, sem glassmorphism agressivo e sem gradientes que comprometam a leitura).

---

## 2. Tokens de Cor Semânticos

A paleta de cores provisória (baseada nas especificações do prompt mestre) é organizada em tokens semânticos rigorosamente definidos em `@grupo-j/design-tokens`:

### 2.1 Cores da Marca (Brand)
* `brand.primary`: `#034EFE` (Azul Elétrico Principal — CTA principal, destaque de marca)
* `brand.primaryHover`: `#023ECC` (Azul Escuro para hover)
* `brand.navy`: `#00091D` (Azul-Marinho Profundo — cabeçalhos, barras laterais, contraste premium)
* `brand.surfaceSubtle`: `#F4F6FB` (Azul acinzentado muito suave para fundos)

### 2.2 Cores de Superfície e Fundo (Surface)
* `surface.default`: `#FFFFFF` (Fundo de cartões, formulários e modais)
* `surface.subtle`: `#F8FAFC` (Fundo de páginas e áreas secundárias)
* `surface.muted`: `#DEDEDE` (Cinza claro para divisores e fundos de skeleton)
* `surface.dark`: `#00091D` (Superfície escura para contraste institucional)

### 2.3 Tipografia e Texto (Text)
* `text.primary`: `#0F172A` (Preto azulado de altíssimo contraste para títulos e corpo principal)
* `text.secondary`: `#475569` (Cinza neutro médio para legendas e textos de apoio)
* `text.muted`: `#94A3B8` (Cinza claro para placeholders e metadados desabilitados)
* `text.inverse`: `#FFFFFF` (Texto branco sobre superfícies escuras ou botões primários)

### 2.4 Status Operacionais (Status)
* `status.success`: `#10B981` (Verde Esmeralda — pagamentos aprovados, benefícios disponíveis, agendamentos confirmados)
* `status.warning`: `#F59E0B` (Âmbar — pendências de aprovação, carência de troca de oficina ativa, alertas)
* `status.danger`: `#EF4444` (Vermelho Vivo — inadimplência, pagamentos recusados, erros críticos)
* `status.info`: `#034EFE` (Azul Informativo — avisos do sistema)

### 2.5 Bordas e Foco
* `border.default`: `#E2E8F0` (Borda neutra para cartões e inputs)
* `border.focus`: `#034EFE` (Borda de foco acessível com anel de 2px)

---

## 3. Escala Tipográfica e Espaçamentos

* **Tipografia Primária Web**: `Inter, system-ui, -apple-system, sans-serif`
* **Tipografia Mobile**: Fontes nativas do sistema (San Francisco no iOS, Roboto no Android) para máxima fluidez e suporte automático a dimensionamento dinâmico de texto (Dynamic Type / Acessibilidade).
* **Grid de Espaçamento**: Base 4px (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`).
* **Raios de Borda (Radii)**:
  - `sm`: 4px
  - `md`: 8px (padrão para botões e inputs)
  - `lg`: 12px (padrão para cartões de benefícios e oficinas)
  - `xl`: 16px (padrão para modais e bottom sheets)
  - `full`: 9999px (pílulas de status e avatares)
