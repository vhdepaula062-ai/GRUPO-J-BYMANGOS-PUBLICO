# Guia Oficial de Publicação em Domínio e Produção — Grupo J

Este documento fornece as instruções arquiteturais e operacionais para publicação de todo o ecossistema digital do **Grupo J** em ambiente de produção sob domínio próprio (ex: `grupoj.com.br`).

---

## 1. Topologia de Domínios e Roteamento DNS

Para garantir isolamento de segurança, proteção contra vazamento de cookies de sessão e conformidade com as regras de subdomínio, adote a seguinte divisão:

| Aplicação | Subdomínio Recomendado | Função |
| :--- | :--- | :--- |
| **`workshop-web`** | `grupoj.com.br` / `parceiros.grupoj.com.br` | Landing page pública, credenciamento (`/seja-parceiro`) e SaaS restrito das oficinas parceiras. |
| **`admin-web`** | `admin.grupoj.com.br` | Backoffice administrativo restrito da diretoria com MFA compulsório. |
| **`api`** | `api.grupoj.com.br` | Gateway central de APIs, rotas seguras e ingestão de webhooks de pagamento. |
| **`customer-mobile`** | Lojas de Aplicativos (App Store / Google Play) | App nativo para clientes motoristas. |

---

## 2. Opção A: Publicação Rápida e Serverless via Vercel (Recomendada)

Por ser um monorepo construído em Next.js 14 e Turborepo, a Vercel oferece suporte nativo com deploy automático a cada `git push`.

### Configuração de Projetos na Vercel

Crie 3 projetos independentes na Vercel vinculados ao mesmo repositório Git:

#### Projeto 1: Portal das Oficinas & Institucional (`workshop-web`)
* **Root Directory**: `apps/workshop-web`
* **Framework Preset**: Next.js
* **Build Command**: `cd ../.. && pnpm turbo run build --filter=workshop-web`
* **Output Directory**: `.next`
* **Domínio Associado**: `grupoj.com.br` e `www.grupoj.com.br` (ou `parceiros.grupoj.com.br`)

#### Projeto 2: Backoffice Administrativo (`admin-web`)
* **Root Directory**: `apps/admin-web`
* **Framework Preset**: Next.js
* **Build Command**: `cd ../.. && pnpm turbo run build --filter=admin-web`
* **Output Directory**: `.next`
* **Domínio Associado**: `admin.grupoj.com.br`

#### Projeto 3: API Gateway (`api`)
* **Root Directory**: `apps/api`
* **Framework Preset**: Next.js
* **Build Command**: `cd ../.. && pnpm turbo run build --filter=api`
* **Output Directory**: `.next`
* **Domínio Associado**: `api.grupoj.com.br`

---

## 3. Configuração de DNS (Registro.br / Cloudflare)

Configure as seguintes entradas na zona de DNS do domínio:

```dns
; Landing Page e Portal das Oficinas
@                IN  A      76.76.21.21
www              IN  CNAME  cname.vercel-dns.com.
parceiros        IN  CNAME  cname.vercel-dns.com.

; SaaS Administrativo
admin            IN  CNAME  cname.vercel-dns.com.

; API Gateway
api              IN  CNAME  cname.vercel-dns.com.
```

---

## 4. Variáveis de Ambiente Obrigatórias em Produção

Ao configurar as variáveis de ambiente no painel de produção (Vercel ou servidor VPS), defina:

### Variáveis Globais de Produção
```env
NODE_ENV=production
APP_ENV=production
LOG_LEVEL=info

# Supabase Produção
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# URLs Públicas sob Domínio
NEXT_PUBLIC_API_URL=https://api.grupoj.com.br
NEXT_PUBLIC_ADMIN_URL=https://admin.grupoj.com.br
NEXT_PUBLIC_WORKSHOP_URL=https://grupoj.com.br

# Gateway de Pagamentos Real (Mercado Pago)
PAYMENT_GATEWAY_PROVIDER=mercadopago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-[SEU-TOKEN-REAL-DE-PRODUCAO]
MERCADO_PAGO_WEBHOOK_SECRET=[SEU-SECRET-DE-WEBHOOK-MERCADOPAGO]

# Criptografia LGPD de CPF (Gerar chaves seguras de 64 caracteres hexadecimais)
CPF_ENCRYPTION_KEY=[CHAVE-HEXADECIMAL-AES256-DE-64-CHARS]
CPF_BLIND_INDEX_PEPPER=[PEPPER-HEXADECIMAL-HMAC-DE-64-CHARS]

# Sessão e Cookies Seguros
SESSION_SECRET=[FRASE-SECRETA-MUITO-LONGA-E-ALEATORIA-DE-MINIMO-32-CHARS]
```

---

## 5. Opção B: Publicação em VPS / Servidor Dedicado com Docker

Para clientes que utilizam infraestrutura própria (AWS EC2, DigitalOcean, Hetzner, Docker Swarm ou Kubernetes), o projeto suporta compilação em container otimizada:

1. Configure `output: "standalone"` em cada `next.config.mjs`;
2. Compile as imagens com os Dockerfiles de cada aplicação;
3. Suba um proxy reverso NGINX ou Traefik com Let's Encrypt para terminação SSL automática em cada subdomínio.

---

## 6. Publicação do Aplicativo Mobile (`customer-mobile`)

1. **Configurar EAS (Expo Application Services)**:
   ```bash
   pnpm --filter customer-mobile add -D eas-cli
   npx eas login
   npx eas project:init
   ```
2. **Build para Apple App Store**:
   ```bash
   npx eas build --platform ios --profile production
   npx eas submit --platform ios
   ```
3. **Build para Google Play Store**:
   ```bash
   npx eas build --platform android --profile production
   npx eas submit --platform android
   ```
4. **URLs de Produção no App**:
   - Assegure que as variáveis `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_SUPABASE_URL` apontem para `https://api.grupoj.com.br` e para o projeto Supabase em produção.
