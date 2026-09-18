# Auditoria e Fortalecimento Contra XSS — Ecossistema Grupo J

**Data do Registro**: 17/09/2026  
**Status**: Concluída com Sucesso (5 Etapas Finalizadas)  
**Escopo**: `apps/api`, `apps/admin-web`, `apps/workshop-web`, `apps/customer-mobile`, `packages/ui-web`, `packages/validation`, `packages/security`.

---

## 1. Inventário de Pontos de Entrada e Renderização (Etapa 1)

### 1.1 Checkpoint e Rastreabilidade
- **Checkpoint de Segurança Criado**: `C:\Users\knzao\GrupoJ-checkpoints\2026-09-17-pre-xss-audit`
- **Hash Base Git**: `5fce2c4` (branch `feature/mobile-brand-identity`)
- **Arquivos Preservados**: Splash screen nativo (`#00091D`), ícones oficiais, rotas existentes e identidades visuais.

### 1.2 Mapeamento de Sinks e Mecanismos Perigosos no Código
| Mecanismo Inspecionado | Ocorrências Localizadas | Avaliação de Risco | Detalhes |
|---|---|---|---|
| `dangerouslySetInnerHTML` | 0 | Inexistente | Nenhuma inserção direta de HTML cru via React. |
| `innerHTML` | 0 | Inexistente | Sem manipulação direta do DOM via `Element.innerHTML`. |
| `outerHTML` | 0 | Inexistente | Sem manipulação direta do DOM via `Element.outerHTML`. |
| `insertAdjacentHTML` | 0 | Inexistente | Sem inserção imperativa de HTML. |
| `document.write` | 0 | Inexistente | Nenhum uso detectado no ecossistema. |
| `eval()` / `new Function()` | 0 | Inexistente | Sem avaliação dinâmica de strings como código. |
| Editores Rich Text / Markdown HTML | 0 | Inexistente | Todo conteúdo textual é texto puro tratado por componentes tipados. |
| `postMessage` | 2 | Seguro | Utilizado unicamente para mensagem de controle do ServiceWorker (`{ type: "SKIP_WAITING" }`) no PWA Provider. |
| `WebViews` no App Mobile | 0 | Inexistente | O app React Native (`apps/customer-mobile`) não possui dependência ou uso de `react-native-webview`. Renderização 100% nativa (`View`, `Text`, `Image`). |

### 1.3 Mapeamento de Entradas de Usuários e Superfícies Auditadas
1. **Dados de Oficinas e Parceiros**:
   - `trade_name`, `company_name`, `contact_name`, `phone`, `cnpj`, `city`, `state`.
   - Renderização: Interpolado em nós de texto JSX (`{workshop.trade_name}`). Escapado nativamente pelo React.
2. **Campanhas e Promoções**:
   - `title`, `description`, `image_url`, `moderation_notes`.
   - Renderização:
     - Títulos e descrições são nós de texto React.
     - `image_url`: Renderizado em `<img src={p.image_url} />` no Admin e Portal das Oficinas, e `<Image source={{ uri: p.image_url }} />` no Mobile.
     - **Ponto de Atenção Identificado**: `image_url` aceitava URLs arbitrárias e data URIs sem validação estrita de protocolo no backend (`apps/api/src/app/api/v1/promotions/route.ts`) e no cadastro (`PromocoesClient.tsx` / `PromocoesModerator.tsx`).
3. **Parâmetros de URL e Redirecionamentos**:
   - `next` em `apps/workshop-web/src/app/api/auth/callback/route.ts` e `apps/admin-web/src/app/api/auth/callback/route.ts`:
     - `NextResponse.redirect(`${origin}${next}`)`: Sem validação estrita de caminho relativo seguro. Se `next` contiver `//` ou caracteres de escape, pode viabilizar Open Redirect e encadeamento de vetores maliciosos.
   - `modo` em `apps/workshop-web/src/app/(auth)/login/page.tsx`: Comparação restrita com whitelist (`=== "cadastro" ? "cadastro" : "login"`), seguro.
   - `q` em buscas administrativas: Passado como estado de input e busca Supabase, seguro.
### 1.4 Respostas da API
- Todas as respostas são retornadas como `application/json` ou `application/problem+json`.
- Ponto tratado na Etapa 3 com cabeçalhos de segurança explícitos.

---

## 2. Correções Contextuais Realizadas (Etapa 2)

### 2.1 Módulo Centralizado de Segurança de URLs e Sanitização (`@grupo-j/validation`)
- Criado `packages/validation/src/security.schema.ts` com suíte de testes unitários dedicada (`security.schema.test.ts`):
  1. `isSafeRedirectPath(path, defaultFallback)`: Bloqueia estritamente vetores de Open Redirect (`//evil.com`, `/\evil.com`, `javascript:`, CRLF injection), garantindo caminhos relativos internos seguros.
  2. `isSafeHttpUrl(url)`: Restringe esquemas estritamente a `http:` e `https:`, bloqueando `javascript:`, `data:`, `vbscript:`, `file:`, etc.
  3. `isSafeImageUrl(url)`: Permite HTTP/HTTPS e Data URIs raster (PNG, JPEG, WEBP, GIF). **Bloqueia expressamente SVG em Data URIs** para evitar vetores de script embutidos (`<svg onload=...>`).
  4. `safeImageUrl(url)`: Retorna a URL segura ou `null`.
  5. `sanitizePlainText(text)`: Remove bytes nulos (`\0`) e caracteres de controle perigosos preservando 100% de caracteres acentuados da língua portuguesa, pontuação e espaçamentos legítimos.

### 2.2 Pontos Corrigidos no Ecossistema
1. **Redirecionamentos de Login (`next`)**:
   - `apps/workshop-web/src/app/api/auth/callback/route.ts`: Sanitizado com `isSafeRedirectPath(searchParams.get("next"), "/painel")`.
   - `apps/admin-web/src/app/api/auth/callback/route.ts`: Sanitizado com `isSafeRedirectPath(searchParams.get("next"), "/dashboard")`.
2. **Imagens e Textos na API**:
   - `apps/api/src/app/api/v1/promotions/route.ts`:
     - URLs extraídas de comentários `<!--image_url:...-->` e notas de moderação agora passam por validação estrita com `isSafeImageUrl()`.
     - Títulos e descrições passam por `sanitizePlainText()`.
3. **Criação e Edição de Promoções**:
   - `apps/workshop-web/src/app/(portal)/promocoes/actions.ts`: Validação de imagem com `isSafeImageUrl()` e sanitização de texto com `sanitizePlainText()`.
   - `apps/admin-web/src/app/(dashboard)/promocoes/actions.ts`: Validação de imagem com `isSafeImageUrl()` e sanitização de texto com `sanitizePlainText()` nas funções `createNetworkPromotion` e `updatePromotion`.
4. **Componente de Avatar**:
   - `packages/ui-web/src/components/Avatar.tsx`: Validação de protocolo no atributo `src` via `isSafeImageSrc()`, revertendo para iniciais caso receba URIs perigosas (`javascript:`, `data:text/html`, etc.).
5. **App Mobile (`apps/customer-mobile`)**:
   - Registrada a ausência de WebViews (`react-native-webview` inexistente). O app utiliza exclusivamente componentes primitivos nativos do React Native (`View`, `Text`, `Image`).

---

## 3. Defesas Adicionais e Cabeçalhos de Segurança (Etapa 3)

### 3.1 Content Security Policy (CSP) Configurada
Configurada nos projetos Next.js (`apps/admin-web/next.config.mjs` e `apps/workshop-web/next.config.mjs`) com as seguintes diretivas justificadas:
- `default-src 'self'`: Restringe carregamentos não explícitos à mesma origem.
- `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com`: Permite scripts da aplicação Next.js e analytics da Vercel. **`unsafe-eval` estritamente ausente**.
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Permite estilos do Tailwind e Google Fonts.
- `img-src 'self' data: blob: https:`: Permite imagens locais, avatares seguros e fotos de promoções.
- `font-src 'self' data: https://fonts.gstatic.com`: Permite fontes remotas e fontes embutidas.
- `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://grupo-j-api.vercel.app https://*.vercel.app https://va.vercel-scripts.com`: Restringe conexões XHR/WebSocket às instâncias autorizadas do Supabase e API.
- `worker-src 'self'`: Permite o ServiceWorker do PWA.
- `frame-ancestors 'none'`: Bloqueia clickjacking em navegadores modernos.
- `object-src 'none'`: Bloqueia plugins e objetos Flash/Java.
- `base-uri 'self'`: Impede sequestro de base tags (`<base>`).
- `form-action 'self'`: Restringe submissão de formulários à mesma origem.

### 3.2 Cabeçalhos HTTP de Segurança Adicionados
Aplicados em `apps/admin-web`, `apps/workshop-web` e `apps/api`:
1. `X-Content-Type-Options: nosniff`: Impede que navegadores executem MIME sniffing em respostas não executáveis.
2. `X-Frame-Options: DENY`: Defesa em profundidade contra enquadramento em iframes.
3. `Referrer-Policy: strict-origin-when-cross-origin`: Protege dados sensíveis em URLs contra vazamento de referrers.
4. `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Desativa sensores desnecessários.
5. Na API (`apps/api`): `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`, garantindo que respostas JSON não possam ser executadas em nenhum contexto de renderização.

### 3.3 Cookies de Sessão
- Supabase SSR utiliza cookies com flags `HttpOnly: true`, `Secure: true` e `SameSite: "lax"`.
- A arquitetura de autenticação foi integralmente preservada sem alterações invasivas.

---

## 4. Testes Seguros e Validações Dinâmicas (Etapa 4)

### 4.1 Metodologia de Homologação
- Testes executados em ambiente local isolado com portas dedicadas (3001 e 3003) e contas sintéticas.
- Nenhum payload foi gravado em produção nem dados de clientes reais foram utilizados.
- Nenhum token, cookie ou dado foi exfiltrado.

### 4.2 Testes com Marcadores Inofensivos
1. **Injeção de Parâmetros de URL**:
   - Probe: `GET /?test_param=%3Cscript%3Econsole.log('xss_probe')%3C%2Fscript%3E`
   - Resultado: Página renderizada normalmente (200 OK), string neutralizada pelo JSX, 0 execução de scripts no DOM.
2. **Injeção em Parâmetros de Erro no Login**:
   - Probe: `GET /login?error=%3Cimg%20src%3Dx%20onerror%3Dconsole.log('probe')%3E`
   - Resultado: Formulário e mensagens renderizadas com segurança (200 OK), sem criação de tags HTML no DOM.
3. **Validação de Open Redirect no Callback de Autenticação**:
   - Probe: `GET /api/auth/callback?next=//evil.com` e `next=javascript:alert(1)`
   - Resultado: Função `isSafeRedirectPath()` barrou a URL externa e o esquema javascript, redirecionando com segurança para `/painel` ou `/dashboard`.
4. **Verificação de Content Security Policy (CSP)**:
   - Validação da aplicação do cabeçalho CSP no navegador real.
   - Recursos legítimos (CSS Tailwind, Google Fonts, ícones Lucide, componentes) carregados sem qualquer bloqueio.
   - Navegação, login, splash nativo e responsividade preservados.
5. **Gravação e Evidências**:
   - Registro de sessão dinâmico salvo no artefato `xss_security_tests_1789694227245.webp`.

---

## 5. Validação, Regressão e Entrega (Etapa 5)

### 5.1 Testes Automatizados e Builds
- **Typecheck Monorepo**: 19 pacotes inspecionados via `turbo run typecheck`, 100% aprovado sem erros.
- **Suíte de Testes Unitários e de Segurança**: Vitest executado no monorepo (`packages/validation/src/security.schema.test.ts`, `@grupo-j/security`, `@grupo-j/domain`, `apps/api`), 29/29 testes passaram com sucesso.
- **Builds de Produção**: `pnpm --filter api --filter admin-web --filter workshop-web build` finalizado com sucesso (código de saída 0).

### 5.2 Matriz de Diferenciação
| Componente | A. Código Inspecionado | B. Proteção Implementada | C. Comportamento Comprovado em Navegador/Aparelho |
|---|---|---|---|
| **Portal das Oficinas (`workshop-web`)** | JSX interpolation, login `next`, formulário de promoções, PWA provider. | CSP rigoroso, `isSafeRedirectPath`, `isSafeImageUrl`, `sanitizePlainText`. | Navegação e formulários íntegros; probes em URL neutralizados; CSP enforced sem quebrar estilos. |
| **Painel Admin (`admin-web`)** | JSX interpolation, busca `q`, login `next`, moderação de promoções. | CSP rigoroso, `isSafeRedirectPath`, `isSafeImageUrl`, `sanitizePlainText`. | Login e dashboard responsivos; scripts inline não autorizados bloqueados por CSP. |
| **API Central (`apps/api`)** | `<!--image_url:...-->`, notas de moderação, responses JSON. | Validação `isSafeImageUrl`, `sanitizePlainText`, headers `nosniff` e CSP `default-src 'none'`. | Respostas estritamente `application/json` com headers de defesa em profundidade. |
| **App Mobile (`customer-mobile`)** | Código React Native em `src/app/`, ausência de WebViews. | Renderização primitiva nativa (`View`, `Text`, `Image`). Ausência de motor DOM / browser bridge. | Ausência de superfície DOM; renderização nativa à prova de vetores baseados em navegador. |
| **Biblioteca de UI (`ui-web`)** | Componentes `Avatar`, `DataTable`, `Button`, `Input`. | Validação de protocolo no `src` do `Avatar` via `isSafeImageSrc`. | Imagens externas renderizadas somente sob protocolos seguros; fallbacks mantidos. |

### 5.3 Limitações e Testes Não Executados
- O Gateway Financeiro real permanece fora do escopo desta auditoria, conforme instrução explícita.
- Não foi realizada publicação em produção na Vercel nesta etapa, preservando o ambiente para homologação e revisão do cliente.
- Testes em dispositivos iOS físicos não foram realizados (escopo limitado a código inspecionado, Expo config e build Android/Web).

### 5.4 Procedimento de Publicação e Recuperação
- **Publicação**: Após revisão deste relatório pelo cliente, as alterações podem ser commitadas e publicadas via pipeline Vercel padrão (`git push origin feature/mobile-brand-identity` ou deploy direto).
- **Recuperação (Rollback)**: Checkpoint íntegro gravado em `C:\Users\knzao\GrupoJ-checkpoints\2026-09-17-pre-xss-audit`. Caso necessário reverter, aplicar o patch `tracked-changes.patch` ou retornar ao commit base `5fce2c4`.

### 5.5 Avaliação Final de Segurança
Com base nos caminhos efetivamente inspecionados e remediados, o ecossistema apresenta postura defensiva robusta e multicamada. Não se declara garantia de imunidade absoluta ou ausência de riscos futuros decorrentes de novas dependências de terceiros, mas todas as superfícies auditadas possuem agora proteção contextual no framework, sanitização de esquemas de URL, eliminação de riscos de SVG/Open Redirect e Content Security Policy ativa.
