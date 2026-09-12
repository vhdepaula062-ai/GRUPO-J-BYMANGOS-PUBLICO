# Sistema de Motion Design e Microinterações Premium — Grupo J

## 1. Visão Geral e Filosofia de Movimento

O **Sistema de Motion Design do Grupo J** foi concebido para transformar a interface das aplicações web em uma experiência fluida, sofisticada, leve e de alta confiabilidade, inspirada na precisão e na física natural dos melhores produtos digitais mundiais (como os princípios de acabamento e transição da Apple).

O movimento atua como uma camada funcional de acabamento e comunicação de hierarquia:
* **Física Natural**: Todas as acelerações e desacelerações utilizam curvas de Bézier cúbicas elásticas (`[0.22, 1, 0.36, 1]`) ou molas com amortecimento controlado, evitando paradas bruscas ou movimentos robóticos.
* **Discrição e Respeito ao Conteúdo**: Nenhum texto importante permanece desfocado ou oculto; as inclinações 3D são estritamente limitadas a no máximo 2.5°; tabelas, dados financeiros e formulários sensíveis não utilizam tilt.
* **Isolamento de Plataforma**: O sistema é de aplicação **exclusiva na camada web** (`apps/workshop-web`, `apps/admin-web` e `@grupo-j/ui-web`), mantendo o ecossistema móvel nativo (`apps/customer-mobile` e `packages/ui-mobile`) 100% inalterado.

---

## 2. Tokens Semânticos de Movimento (`packages/ui-web/src/motion/tokens.ts`)

| Categoria | Token | Valor | Aplicação Semântica |
| :--- | :--- | :--- | :--- |
| **Duração** | `instant` | `120ms` (`0.12s`) | Microinterações de clique, toggles imediatos, seleção de chips. |
| | `fast` | `180ms` (`0.18s`) | Hover de botões, deslocamento de setas (4px), badges e tooltips. |
| | `normal` | `280ms` (`0.28s`) | Elevação de cartões, transição de abas e abertura de dropdowns. |
| | `elegant` | `420ms` (`0.42s`) | Entrada de modais, drawers laterais e blocos de conteúdo. |
| | `sectionEnter` | `600ms` (`0.60s`) | Entrada heróica de seções e transições de tela principais. |
| **Easing** | `standard` | `[0.22, 1, 0.36, 1]` | Curva principal de desaceleração elástica inspirada no acabamento Apple. |
| | `gentle` | `[0.25, 0.1, 0.25, 1]` | Transições suaves de opacidade e cores de fundo. |
| **Molas (Springs)** | `gentle` | `{ stiffness: 120, damping: 14 }` | Flutuação suave e retorno elástico de cards. |
| | `snappy` | `{ stiffness: 300, damping: 24 }` | Efeito magnético de botões e micro-atração de ponteiro. |
| | `tiltReturn` | `{ stiffness: 220, damping: 22 }` | Retorno suave do cartão 3D ao centro quando o cursor sai. |
| **Deslocamento** | `small` | `8px` | Deslocamento sutil para badges e subtítulos. |
| | `medium` | `16px` | Deslocamento padrão para parágrafos e cards. |
| | `large` | `24px` | Deslocamento para títulos de seções principais. |
| **Blur de Entrada** | `subtle` | `4px` | Desfoque leve para parágrafos secundários. |
| | `standard` | `8px` | Desfoque padrão para títulos e cartões de credenciamento. |
| | `hero` | `10px` | Desfoque refinado para o título principal da landing page. |
| **Tilt 3D** | `maxDeg` | `2.5°` | Rotação angular máxima nos eixos X e Y. |
| | `perspective` | `1000px` | Distância focal da perspectiva CSS. |
| | `scale` | `1.015` | Escala máxima no hover com ponteiro. |
| **Stagger** | `standard` | `70ms` (`0.07s`) | Cascata progressiva de cards e passos operacionais. |

---

## 3. Catálogo de Componentes de Motion Design (`@grupo-j/ui-web`)

1. **`MotionProvider`**:
   - Componente raiz que injeta `<MotionConfig reducedMotion="user">`, garantindo que toda a árvore obedeça instantaneamente à preferência de redução de movimento do sistema operacional.
2. **`useMotionCapabilities`**:
   - Hook de detecção em tempo real de:
     - `prefersReducedMotion`: se o usuário ativou redução de movimento;
     - `canHover` e `hasFinePointer`: se o dispositivo possui mouse de precisão ou tela touch.
3. **`Reveal`**:
   - Animação de entrada no viewport com `opacity` e `translateY` sutil (16px), acionada via Intersection Observer e executada apenas 1 vez.
4. **`BlurReveal`**:
   - Entrada com desfoque transitório (`filter: blur(8px) -> blur(0px)`) e `opacity: 0 -> 1`.
   - **Fallback Acessível**: Em dispositivos com preferência por redução de movimento, converte-se automaticamente em fade limpo sem desfoque.
5. **`StaggerContainer` & `StaggerItem`**:
   - Orquestrador em cascata com atraso progressivo (70ms) para listas de cards, passos e indicadores, evitando sobrecarga visual.
6. **`TiltCard`**:
   - Cartão com inclinação 3D sutil orientada ao ponteiro do mouse, escala de 1.015, elevação suave e retorno elástico via spring.
   - **Trava de Segurança**: Totalmente desativado em dispositivos móveis/touch e quando o usuário solicita redução de movimento (substituído por hover plano).
7. **`AnimatedCounter`**:
   - Contagem suave de números e moedas (ex: R$ 50, 4 serviços, 100%, R$ 89.400).
   - **Acessibilidade & SEO**: O valor final completo existe estaticamente no DOM e possui `aria-label` estático, evitando spam sonoro para leitores de tela.
8. **`MagneticButton`**:
   - Microatração magnética discreta (máx 4-6px) para botões primários de destaque.
   - Ativo somente em desktops com mouse (`pointer: fine`); desligado em touch e com reduced-motion.
9. **`motion.css`**:
   - Classes utilitárias GPU (`transform-gpu`, `perspective-1000`, `backface-hidden`), keyframes de flutuação lenta (`@keyframes floatGentle`) e regras obrigatórias de fallback para `@media (prefers-reduced-motion: reduce)`.

---

## 4. Matriz de Aplicação por Páginas e Componentes

| Página / Tela | Componente / Efeito de Movimento | Função e Experiência do Usuário |
| :--- | :--- | :--- |
| **Landing Page (`/`)** | **Header Dinâmico** | Transição suave de fundo transparente para branco sólido com `backdrop-filter: blur(12px)` e borda sutil ao rolar a página; micro-underline animado nos links de navegação (`nav-link-animated`). |
| | **Hero Principal** | Entrada sequencial: Selo (`Reveal`) -> Título (`BlurReveal` 8px a 0) -> Parágrafo (`Reveal`) -> CTAs (`MagneticButton`) -> Indicadores com `AnimatedCounter` (R$ 50, 4 serviços, 100%). |
| | **Elemento Circular do Carro** | Flutuação lenta CSS 3D (deslocamento Y de 6-8px), tags de serviços flutuando em ritmos assíncronos (`float-tag-1/2/3`), leve parallax de cursor (máx 2.5°), pausa automática quando a aba estiver oculta (`visibilitychange`). |
| | **Como Funciona** | Título e descrição revelados com fade e blur curto; 4 passos em `StaggerContainer` com escala nos números de etapa e elevação de 4px no hover. |
| | **Para Motoristas** | 4 cartões de benefícios envolvidos em `TiltCard` em desktop (elevação plana em touch). |
| | **Para Oficinas (Navy)** | Fundo com iluminação azul difusa suave (`navy-diffuse-glow`), cascata de benefícios em `StaggerContainer`, destaque no card de R$ 500/mês com `AnimatedCounter` e hover dinâmico na seta do CTA. |
| | **Depoimento de Jotinha** | Entrada única com fade e escala elástica suave, sem repetições ou loops. |
| | **Rodapé** | Entrada discreta e estável com links animados. |
| **Credenciamento (`/seja-parceiro`)** | **Cartão do Formulário** | Entrada sofisticada com `BlurReveal` e feedback suave de foco nos campos. |
| **Painel da Oficina (`/painel`)** | **KPIs e Atendimentos** | Grade de KPIs em `StaggerContainer`, `AnimatedCounter` em clientes e atendimentos do mês; entrada suave da tabela sem oscilação. |
| **Painel Admin (`/dashboard`)** | **KPIs Executivos** | Grade de KPIs em `StaggerContainer`, `AnimatedCounter` no MRR (R$ 89.400,00) e motoristas ativos (1.428); moderação e governança com entrada estável em `Reveal`. |

---

## 5. Diretrizes de Acessibilidade (WCAG 2.2 AA)

1. **Suporte Obrigatório a `prefers-reduced-motion`**:
   - Todas as animações físicas de deslocamento, rotação 3D e flutuação contínua são canceladas.
   - O componente `MotionProvider` configura o `motion/react` com `reducedMotion="user"`.
   - O arquivo `motion.css` força `animation-duration: 0.01ms !important` e `transition-duration: 0.01ms !important`.
   - Os contadores numéricos exibem o valor final instantaneamente sem animação.
2. **Navegação por Teclado e Foco**:
   - Nenhum efeito de hover ou magnético altera a ordem de tabulação no DOM.
   - O anel de foco `focus-visible:ring-2 focus-visible:ring-[#034EFE]` permanece nítido e visível.
3. **Leitores de Tela (Screen Readers)**:
   - Os contadores utilizam `aria-label` estático e `aria-hidden="true"` no texto interpolado visualmente, eliminando a poluição sonora de múltiplos números intermediários.

---

## 6. Diretrizes de Performance & Core Web Vitals

* **Aceleração por Hardware (GPU)**:
  - 100% das animações contínuas e de entrada utilizam estritamente as propriedades `transform` e `opacity`.
  - Zero animações em `width`, `height`, `top`, `left` ou `margin`.
* **Cumulative Layout Shift (CLS)**:
  - Elementos utilizam altura e proporções mínimas fixadas em CSS antes da animação entrar, garantindo CLS `< 0.02`.
* **Interaction to Next Paint (INP)**:
  - Cálculos de rotação do ponteiro nos cartões 3D utilizam variáveis de movimento diretas (`useMotionValue` + `useSpring`), eliminando re-renderizações no ciclo do React (INP `< 50ms`).
* **Pausa em Background**:
  - Listeners monitoram `document.visibilityState` para pausar animações flutuantes quando a aba do navegador não estiver ativa.
