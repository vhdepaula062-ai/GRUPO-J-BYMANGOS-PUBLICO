# Runbook Operacional e Procedimento de Emergência — Grupo J

## 1. Operação do Monorepo

### 1.1 Pré-requisitos
* Node.js >= 20.x (ambiente atual: v24.20.0)
* pnpm >= 9.x (ou npx pnpm)
* Git

### 1.2 Instalação e Execução Local
```bash
# 1. Instalar todas as dependências do monorepo
pnpm install

# 2. Executar validações de qualidade
pnpm lint
pnpm typecheck
pnpm test

# 3. Iniciar todos os serviços em modo desenvolvimento simultâneo
pnpm dev

# Ou iniciar aplicações individualmente:
pnpm --filter admin-web dev       # http://localhost:3000
pnpm --filter workshop-web dev    # http://localhost:3001
pnpm --filter api dev             # http://localhost:3002
pnpm --filter customer-mobile dev # Expo Metro bundler
```

---

## 2. Procedimento de Break-Glass (Mangos Support)

Quando uma intervenção de emergência técnica for exigida pelo proprietário do Grupo J:
1. O proprietário do Grupo J gera um código de sessão no painel administrativo (`/configuracoes -> Acesso Técnico Emergencial`).
2. O engenheiro da Mangos autentica-se com suas credenciais de suporte e insere o código com segundo fator (MFA) ativo.
3. A sessão é aberta no banco com registro explícito em `admin_access_sessions`:
   - Motivo formal da intervenção (ex.: "Incidente INC-402 - Falha de conciliação no webhook").
   - ID do engenheiro da Mangos.
   - Timestamp de início e expiração automática (máximo 120 minutos).
4. O painel administrativo exibe um banner vermelho cintilante: **"SESSÃO DE SUPORTE TÉCNICO MANGOS ATIVA — AUDITORIA EM TEMPO REAL"**.
5. Qualquer tentativa de alteração direta de faturas, cartões de crédito ou senhas de usuários é terminantemente bloqueada pelo sistema.
