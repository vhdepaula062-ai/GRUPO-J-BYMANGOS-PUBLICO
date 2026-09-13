#!/usr/bin/env node
/**
 * GRUPO J — Script de Criação do Primeiro Administrador
 *
 * Use este script para criar o primeiro usuário Super Admin do sistema.
 * Execute APENAS uma vez, após configurar as variáveis de ambiente.
 *
 * Uso:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbG... \
 *   ADMIN_EMAIL=joaquim@grupoj.com.br \
 *   ADMIN_PASSWORD=SenhaForte123! \
 *   ADMIN_FULL_NAME="Joaquim" \
 *   node scripts/create-first-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || "Administrador Grupo J";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Erro: ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios.");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error("❌ Senha muito curta. Use pelo menos 12 caracteres com letras, números e símbolos.");
  process.exit(1);
}

// Cliente com permissão total (service_role)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("\n🚀 Iniciando criação do Super Admin...\n");

  // 1. Criar usuário no Supabase Auth
  console.log(`📧 Criando usuário: ${ADMIN_EMAIL}`);
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Confirmar e-mail automaticamente
    user_metadata: {
      full_name: ADMIN_FULL_NAME,
      role: "super_admin"
    }
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("⚠️  Usuário já existe no Auth. Verificando perfil...");
    } else {
      console.error("❌ Erro ao criar usuário:", authError.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Usuário criado no Auth: ${authData.user.id}`);
  }

  // Buscar o usuário (caso já existisse)
  const { data: existingUser } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL);
  if (!existingUser?.user) {
    console.error("❌ Não foi possível localizar o usuário após criação.");
    process.exit(1);
  }

  const userId = existingUser.user.id;
  console.log(`🆔 User ID: ${userId}`);

  // 2. Criar perfil na tabela profiles
  console.log("\n📋 Criando perfil na tabela profiles...");
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: ADMIN_FULL_NAME,
      email: ADMIN_EMAIL,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error("❌ Erro ao criar perfil:", profileError.message);
    process.exit(1);
  }
  console.log("✅ Perfil criado.");

  // 3. Atribuir role super_admin
  console.log("\n🔐 Atribuindo role super_admin...");
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("code", "super_admin")
    .single();

  if (roleError || !roleData) {
    console.error("❌ Role super_admin não encontrada. Execute as migrations e o seed primeiro.");
    console.error("   Comando: supabase db push && supabase db execute < supabase/seed/seed.production.sql");
    process.exit(1);
  }

  const { error: userRoleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_id: roleData.id, granted_by: userId });

  if (userRoleError && !userRoleError.message.includes("duplicate")) {
    console.error("❌ Erro ao atribuir role:", userRoleError.message);
    process.exit(1);
  }
  console.log("✅ Role super_admin atribuída.");

  // 4. Resumo final
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Super Admin criado com sucesso!\n");
  console.log(`   E-mail:     ${ADMIN_EMAIL}`);
  console.log(`   Nome:       ${ADMIN_FULL_NAME}`);
  console.log(`   User ID:    ${userId}`);
  console.log(`   Role:       super_admin`);
  console.log("\n   Próximos passos:");
  console.log("   1. Acesse: https://grupo-j-admin.vercel.app/login");
  console.log(`   2. Use o e-mail: ${ADMIN_EMAIL}`);
  console.log("   3. Ative o MFA em: Configurações → Segurança → Ativar Autenticador");
  console.log("=".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("❌ Erro inesperado:", err);
  process.exit(1);
});
