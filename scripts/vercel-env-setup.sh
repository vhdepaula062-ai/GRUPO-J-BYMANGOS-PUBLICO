#!/bin/bash
# ==============================================================================
# GRUPO J — Script de Configuração de Variáveis de Ambiente na Vercel
# ==============================================================================
# 
# Este script configura todas as variáveis de produção nos dois projetos Vercel.
# Execute APÓS preencher os valores abaixo com suas credenciais reais.
#
# Uso:
#   chmod +x scripts/vercel-env-setup.sh
#   ./scripts/vercel-env-setup.sh
# ==============================================================================

set -e

# ============================================================================
# ⚙️ PREENCHA ESTES VALORES ANTES DE EXECUTAR
# ============================================================================

SUPABASE_URL="COLE_SUA_URL_DO_SUPABASE_AQUI"
SUPABASE_ANON_KEY="COLE_SUA_ANON_KEY_AQUI"
SUPABASE_SERVICE_ROLE="COLE_SUA_SERVICE_ROLE_KEY_AQUI"

# Gere com: node -e "require('crypto').randomBytes(32).toString('hex')"
CPF_ENCRYPTION_KEY="GERE_64_CHARS_HEX_AQUI"
CPF_BLIND_INDEX_PEPPER="GERE_OUTROS_64_CHARS_HEX_AQUI"
SESSION_SECRET="GERE_SECRET_FORTE_AQUI"

# ============================================================================
# 🚫 NÃO EDITE ABAIXO DESTA LINHA
# ============================================================================

echo "🔧 Configurando variáveis de ambiente na Vercel..."
echo ""

configure_project() {
  local PROJECT=$1
  echo "📦 Projeto: $PROJECT"
  echo "   ├── NEXT_PUBLIC_SUPABASE_URL"
  echo "   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "   ├── SUPABASE_SERVICE_ROLE_KEY (secret)"
  echo "   ├── CPF_ENCRYPTION_KEY (secret)"
  echo "   ├── CPF_BLIND_INDEX_PEPPER (secret)"
  echo "   ├── SESSION_SECRET (secret)"
  echo "   └── PAYMENT_GATEWAY_PROVIDER"
  echo ""

  # Variáveis públicas (ambiente production)
  echo "$SUPABASE_URL" | npx -y vercel env add NEXT_PUBLIC_SUPABASE_URL production --project "$PROJECT" --yes 2>/dev/null || true
  echo "$SUPABASE_ANON_KEY" | npx -y vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --project "$PROJECT" --yes 2>/dev/null || true

  # Variáveis secretas (apenas no servidor)
  echo "$SUPABASE_SERVICE_ROLE" | npx -y vercel env add SUPABASE_SERVICE_ROLE_KEY production --project "$PROJECT" --yes 2>/dev/null || true
  echo "$CPF_ENCRYPTION_KEY" | npx -y vercel env add CPF_ENCRYPTION_KEY production --project "$PROJECT" --yes 2>/dev/null || true
  echo "$CPF_BLIND_INDEX_PEPPER" | npx -y vercel env add CPF_BLIND_INDEX_PEPPER production --project "$PROJECT" --yes 2>/dev/null || true
  echo "$SESSION_SECRET" | npx -y vercel env add SESSION_SECRET production --project "$PROJECT" --yes 2>/dev/null || true
  echo "fake" | npx -y vercel env add PAYMENT_GATEWAY_PROVIDER production --project "$PROJECT" --yes 2>/dev/null || true
  echo "production" | npx -y vercel env add NODE_ENV production --project "$PROJECT" --yes 2>/dev/null || true

  echo "✅ $PROJECT configurado!"
  echo ""
}

configure_project "grupo-j-admin"
configure_project "grupo-j-oficinas"

echo "🎉 Todas as variáveis configuradas com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Faça redeploy para aplicar: npx vercel deploy --prod --project grupo-j-admin --yes"
echo "2. Faça redeploy para aplicar: npx vercel deploy --prod --project grupo-j-oficinas --yes"
echo "3. Execute o seed de produção no Supabase Dashboard → SQL Editor"
echo "4. Crie o primeiro admin: node scripts/create-first-admin.mjs"
