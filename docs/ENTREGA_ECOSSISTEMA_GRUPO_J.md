# DOCUMENTO DE ENTREGA E HOMOLOGAÇÃO — ECOSSISTEMA DIGITAL GRUPO J

**Data:** 17 de Setembro de 2026  
**Status Geral:** Homologado e Publicado em Produção  
**Branch de Referência:** `feature/mobile-brand-identity`  
**Checkpoint de Segurança Local:** `C:\Users\knzao\GrupoJ-checkpoints\2026-09-17-pre-ecosystem-remediation`

---

## 1. URLs Oficiais Publicadas e Preservadas

Todos os três serviços foram publicados nos projetos Vercel existentes, com domínio e configuração canônicos preservados:

| Componente | URL de Produção | Vercel Project ID | Status HTTP |
| :--- | :--- | :--- | :--- |
| **API REST Central** | `https://grupo-j-api.vercel.app` | `prj_0saraOHKNjikzwkRpBzSduoBPArL` | **200 OK** (`healthy`) |
| **SaaS Administrativo** | `https://grupo-j-admin.vercel.app` | `prj_i3wf2YpYzkgKSLkQH8ayQ2tGhkiA` | **200 OK** |
| **Portal das Oficinas** | `https://grupo-j-oficinas.vercel.app` | `prj_Ei8T3gD4iTH4yI8XQiFkDphHCbFb` | **200 OK** |

---

## 2. Identificação de Versões e Deployments Realizados

### Commits desta Tarefa:
- **`728af7e`**: `fix(security): endurecer autorizacao, eliminar fallbacks multi-tenant e validar titularidade de veiculos`
- **`2cf2825`**: `test(safety): adicionar guardrail contra escritas acidentais em banco nao isolado`

### Deployments Vercel em Produção:
1. **API (`apps/api` -> `grupo-j-api`)**:
   - **Deployment ID:** `dpl_LgKAcPsWybQgTpLkN1HpboP5dQKs`
   - **URL Imutável:** `https://grupo-j-phug7gfzj-vhdepaula062-1705s-projects.vercel.app`
   - **Alias Canônico:** `https://grupo-j-api.vercel.app`
   - **Verificação de Saúde:** `{"status":"healthy","version":"0.2.0","database":"up","storage":"up"}`

2. **SaaS Admin (`apps/admin-web` -> `grupo-j-admin`)**:
   - **Deployment ID:** `dpl_DrtxdhwCLWDhk7fHS5PGkXY6Ty7F`
   - **URL Imutável:** `https://grupo-j-admin-hnz7lk7y5-vhdepaula062-1705s-projects.vercel.app`
   - **Alias Canônico:** `https://grupo-j-admin.vercel.app`
   - **Verificação de Rota:** `/login` responde 200 OK; rotas protegidas `/dashboard` redirecionam 307 para login com `redirect=%2Fdashboard`.

3. **Portal Oficinas (`apps/workshop-web` -> `grupo-j-oficinas`)**:
   - **Deployment ID:** `dpl_AANxoELJWUZ3UtYqRWzPvKN3iouZ`
   - **URL Imutável:** `https://grupo-j-oficinas-mm5el63ix-vhdepaula062-1705s-projects.vercel.app`
   - **Alias Canônico:** `https://grupo-j-oficinas.vercel.app`
   - **Verificação de Rota:** `/login` responde 200 OK; `/seja-parceiro` responde 200 OK; rotas protegidas `/painel` redirecionam 307 para login.

---

## 3. Arquivo do Aplicativo Mobile (APK Android)

O aplicativo mobile para clientes Android está pronto para instalação e homologação manual pelo cliente:

- **Localização do Arquivo:** `artifacts/android/grupo-j-staging.apk`
- **Tamanho:** 65.410.926 bytes (~62,38 MB)
- **Hash Criptográfico SHA-256:** `995E2DE6166EAED03B61C0E9F51E940FF5CB4425C8E24A385315418E87DCE15D`
- **Versão:** `0.1.0` (versionCode `1`)
- **Package Name:** `br.com.grupoj.autocenter.staging`
- **Endpoint Integrado no Binário:** `https://grupo-j-api.vercel.app` (100% compatível com a API publicada)
- **Splash & Identidade Visual:** Ícone oficial Grupo J e tela splash nativa `#00091D` integrados.

### Roteiro de Instalação e Teste no Android:
1. Copie o arquivo `grupo-j-staging.apk` para o aparelho Android (via cabo USB, Google Drive, WhatsApp ou download direto).
2. No celular, clique no arquivo baixado e autorize a "Instalação de Fontes Desconhecidas" caso solicitado.
3. Abra o app "Grupo J".
4. Verifique a exibição da tela de Splash oficial e transição para a tela de autenticação.
5. Efetue login com as credenciais de teste ou faça um cadastro de motorista.
6. Cadastre um veículo e selecione a oficina parceira desejada.

---

## 4. Correções de Segurança e Isolamento Implementadas (Etapa 1)

1. **Eliminação de Fallbacks Multi-Tenant (`apps/workshop-web/src/lib/queries.ts`)**:
   - Removido o fallback perigoso que selecionava a primeira oficina do banco (`workshops.limit(1)`) caso o usuário logado não tivesse vínculo explícito.
   - Restrito o carregamento de clientes da oficina (`getWorkshopCustomers`) estritamente aos motoristas vinculados via `assigned_workshop_id`.
2. **Proteção no Envio de Promoções (`apps/workshop-web/src/app/(portal)/promocoes/actions.ts`)**:
   - Removida a atribuição automática da primeira oficina encontrada; agora a rota falha de forma segura caso o operador não pertença à oficina.
3. **Bloqueio de Layout no Portal das Oficinas (`apps/workshop-web/src/app/(portal)/layout.tsx`)**:
   - Usuários sem oficina ativa associada são barrados imediatamente e redirecionados para `/login?error=no_workshop`.
4. **Proteção no SaaS Administrativo (`apps/admin-web/src/app/(dashboard)/layout.tsx` e `server.ts`)**:
   - Implementada checagem estrita de função administrativa (`checkIsAdmin()`) com fallback fechado. Usuários não autorizados são impedidos de renderizar o painel e dados sensíveis.
5. **Validação de Titularidade de Veículo na API (`apps/api/src/app/api/v1/benefits/route.ts`)**:
   - A emissão de benefícios e vouchers agora exige validação de que o `vehicle_id` pertence ao motorista autenticado (`vehicle.user_id === user.id`).
   - Bloqueia solicitações de veículos de terceiros com HTTP 403 `vehicle-not-found`.
   - Exige que o motorista possua uma oficina designada ativa (`workshop-required`).
6. **Isolamento de Validação de Vouchers (`apps/api/src/app/api/v1/vouchers/validate/route.ts`)**:
   - Mapeado erro HTTP 403 explícito caso uma oficina tente validar ou liquidar um voucher emitido para outro estabelecimento.
7. **Suíte de Testes de Autorização (`apps/api/src/test/authorization-isolation.test.ts`)**:
   - 14 testes automatizados cobrindo acessos cruzados, requisições não autenticadas e regras de RBAC.

---

## 5. Auditoria de Responsividade e Visual (SaaS)

Testado em navegador via automação nos dois portais web:
- **Desktop (1280x800)**: Layout equilibrado, sidebars fixas sem corte, tabelas com scroll horizontal contido quando necessário, cards alinhados.
- **Tablet (768x1024)**: Reorganização fluida dos grids, modais centralizados e legíveis.
- **Mobile (375x667)**: Menus acessíveis, formulários e inputs ocupando 100% da largura útil sem gerar estouro horizontal no body (`overflow-x`), botões com área de toque confortável.
- **Acessibilidade e Navegação**: Campos possuem labels associados, foco por teclado funcional, estados de loading presentes.

---

## 6. Procedimento de Backup, Recuperação e Rollback

### Rollback Imediato de Publicação (Código/Vercel):
Se uma regressão for identificada em qualquer um dos três frontends/API:
- **Via Vercel CLI:**
  ```powershell
  npx vercel rollback <deployment-id-ou-url-anterior>
  ```
- **Deployments Imediatamente Anteriores Conhecidos:**
  - API: `https://grupo-j-5fckpnxq6-vhdepaula062-1705s-projects.vercel.app`
  - Admin: `https://grupo-j-admin.vercel.app` (build anterior preservado no histórico Vercel)
  - Oficinas: `https://grupo-j-oficinas.vercel.app` (build anterior preservado no histórico Vercel)

> [!WARNING]
> **Limitação do Rollback de Código:** O rollback na Vercel reverte apenas o código e as rotas servidas pelos servidores. Ele **NÃO** reverte alterações estruturais de banco de dados ou dados persistidos durante o período em que a versão esteve no ar.

### Backup e Restauração de Banco de Dados:
- O banco PostgreSQL é hospedado no projeto Supabase `usqplgujxhksjduuturw`.
- O Supabase executa snapshots automáticos diários (Database Backups acessíveis no painel administrativo do Supabase).
- Para extração manual prévia a qualquer migração futura:
  ```bash
  supabase db dump --linked -f backup_schema_and_data.sql
  ```

---

## 7. Variáveis de Ambiente e Configurações

O arquivo `.env.example` na raiz do repositório contém a lista completa e segura de todas as variáveis requeridas, sem expor nenhum segredo de produção.

### Resumo das Variáveis Requeridas:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Conexão pública com Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Acesso backend seguro (nunca exposto em bundles web/mobile).
- `PAYMENT_GATEWAY_PROVIDER`: Configurado como `fake` para homologação. Em produção real, será alterado para `mercadopago` assim que as chaves forem fornecidas.
- `CPF_ENCRYPTION_KEY` & `CPF_BLIND_INDEX_PEPPER`: Chaves criptográficas de conformidade LGPD para proteção de CPFs de motoristas.
- `SESSION_SECRET`: Assinatura criptográfica de cookies de sessão.

---

## 8. Pendências e Próximos Passos (Ações Humanas / Externas)

1. **Credenciais do Gateway de Pagamento Real**:
   - A integração financeira permanece operando em modo controlado/sandbox.
   - Quando o cliente fornecer `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` de produção, as variáveis deverão ser inseridas na Vercel e o provedor alternado para `mercadopago`.
2. **Ambiente Dedicado de Banco de Dados para Testes/CI**:
   - Atualmente, o projeto utiliza a mesma instância de Supabase. Para garantir segurança total, adicionamos a flag `ALLOW_TEST_WRITES=true` que bloqueia execuções acidentais da suíte de teste.
   - Recomenda-se criar um projeto Supabase exclusivo para homologação (`staging-db`) no futuro.
3. **Validação em Aparelho Físico Android**:
   - Como não há aparelho conectado via ADB nesta máquina de build, a validação física deve ser realizada com o APK fornecido (`artifacts/android/grupo-j-staging.apk`).
4. **Publicação nas Lojas (Google Play Store e Apple App Store) e Build iOS**:
   - Fora do escopo desta tarefa (aguarda contratação de contas de desenvolvedor Apple/Google pelo cliente).
