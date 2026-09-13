# Guia de Operacao Real — Ecossistema Grupo J

## Visao Geral do que foi preparado

| O que estava antes | O que esta agora |
| :--- | :--- |
| Login que entrava sem senha | Login real com Supabase Auth (e-mail + senha) |
| Dados mock fixos em codigo | Estrutura pronta para dados reais no banco |
| Banco de dados local (localhost) | Pronto para conectar ao Supabase Cloud |
| Sem protecao de rotas | Middleware que exige sessao JWT valida |
| Pagamentos simulados | Gateway PagSeguro configuravel |

---

## Passo 1 — Criar o Projeto no Supabase (3 minutos)

1. Acesse https://supabase.com e clique em "Start your project"
2. Clique em "New Project"
3. Preencha:
   - Name: grupo-j-production
   - Region: South America (Sao Paulo)  <-- OBRIGATORIO para LGPD
4. Aguarde ~2 minutos

---

## Passo 2 — Obter as Credenciais

No painel do Supabase: Project Settings -> API

Copie 3 valores:
- URL do Projeto: https://XXXXXXXXXXXX.supabase.co
- anon key (publico)
- service_role key (SECRETO — nunca expor)

---

## Passo 3 — Criar o Banco (Migrations)

No Supabase Dashboard -> SQL Editor, execute em ordem:

1. supabase/migrations/20260912000001_initial_schema.sql
2. supabase/migrations/20260912000002_rls_policies.sql
3. supabase/seed/seed.production.sql

---

## Passo 4 — Gerar Chaves de Segurança

No terminal:

  node -e "require('crypto').randomBytes(32).toString('hex')"  <- CPF_ENCRYPTION_KEY
  node -e "require('crypto').randomBytes(32).toString('hex')"  <- CPF_BLIND_INDEX_PEPPER
  node -e "require('crypto').randomBytes(48).toString('base64')" <- SESSION_SECRET

GUARDE ESSES VALORES EM LOCAL SEGURO (ex: Bitwarden).

---

## Passo 5 — Configurar Variaveis na Vercel

Para cada projeto (grupo-j-admin e grupo-j-oficinas):
Vercel Dashboard -> Project -> Settings -> Environment Variables

| Variavel | Valor |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL do Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Chave anon |
| SUPABASE_SERVICE_ROLE_KEY | Chave service_role (Sensitive) |
| CPF_ENCRYPTION_KEY | Gerado no Passo 4 |
| CPF_BLIND_INDEX_PEPPER | Gerado no Passo 4 |
| SESSION_SECRET | Gerado no Passo 4 |
| PAYMENT_GATEWAY_PROVIDER | fake (ate configurar PagSeguro) |
| NODE_ENV | production |

---

## Passo 6 — Criar o Primeiro Admin (Joaquim)

  SUPABASE_URL=https://xxx.supabase.co ^
  SUPABASE_SERVICE_ROLE_KEY=eyJhbG... ^
  ADMIN_EMAIL=joaquim@grupoj.com.br ^
  ADMIN_PASSWORD=SuaSenhaForte123! ^
  ADMIN_FULL_NAME="Joaquim" ^
  node scripts/create-first-admin.mjs

---

## Passo 7 — Redeploy Final na Vercel

  npx vercel deploy --prod --project grupo-j-admin --yes
  npx vercel deploy --prod --project grupo-j-oficinas --yes

---

## Passo 8 — Verificacao

1. Acesse: https://grupo-j-admin.vercel.app/login
2. Use o e-mail e senha criados no Passo 6
3. O login deve autenticar e redirecionar para o Dashboard

---

## Passo 9 — Cadastrar Primeira Oficina

1. Login como Super Admin
2. Vá em Oficinas -> + Cadastrar Nova Oficina
3. Preencha CNPJ, email, telefone
4. Clique em Aprovar Credenciamento
5. A oficina recebe convite por e-mail para criar senha

---

## Passo 10 — Ativar PagSeguro (quando pronto)

1. Criar conta em https://pagseguro.uol.com.br/business/
2. Minha Conta -> Preferencias -> Integracoes -> Tokens e Chaves
3. Na Vercel, atualize:
   - PAYMENT_GATEWAY_PROVIDER = pagseguro
   - PAGSEGURO_EMAIL = seu e-mail
   - PAGSEGURO_TOKEN = seu token
   - PAGSEGURO_MODE = production
4. Redeploy ambos os projetos
