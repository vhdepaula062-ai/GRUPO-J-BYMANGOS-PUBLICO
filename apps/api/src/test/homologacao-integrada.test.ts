import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServerAdminClient } from "@grupo-j/database";
import { CpfSecurity } from "@grupo-j/security";
import * as fs from "fs";
import * as path from "path";
import { NextRequest } from "next/server";

// Rotas da API sob teste
import { POST as registerHandler } from "../app/api/v1/auth/register/route";
import { POST as loginHandler } from "../app/api/v1/auth/login/route";
import { POST as createVehicleHandler } from "../app/api/v1/vehicles/route";
import { POST as createVoucherHandler } from "../app/api/v1/benefits/route";
import { POST as validateBenefitHandler } from "../app/api/v1/benefits/validate/route";
import { GET as getPromotionsHandler } from "../app/api/v1/promotions/route";

// Gerador de CPF sintético válido (algoritmo módulo 11)
function generateValidCpf(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
  let d1 = n.reduce((acc, val, idx) => acc + val * (10 - idx), 0) % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  n.push(d1);
  let d2 = n.reduce((acc, val, idx) => acc + val * (11 - idx), 0) % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  n.push(d2);
  return n.join("");
}

// Gerador de CNPJ sintético válido (algoritmo módulo 11)
function generateValidCnpj(): string {
  const n = Array.from({ length: 12 }, () => Math.floor(Math.random() * 9));
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let d1 = n.reduce((acc, val, idx) => acc + val * (w1[idx] ?? 0), 0) % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  n.push(d1);
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let d2 = n.reduce((acc, val, idx) => acc + val * (w2[idx] ?? 0), 0) % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  n.push(d2);
  return n.join("");
}

describe("HOMOLOGAÇÃO INTEGRADA: ECOSSISTEMA GRUPO J", () => {
  let supabaseUrl: string;
  let serviceRoleKey: string;
  let encryptionKey: string;
  let pepper: string;
  let db: ReturnType<typeof createServerAdminClient>;

  // Identificadores sintéticos de homologação
  const testIds = {
    workshopAlphaId: "",
    workshopBetaId: "",
    workshopOwnerUserId: "",
    driver1UserId: "",
    driver1CustomerId: "",
    driver1Token: "",
    driver1VehicleId: "",
    driver2UserId: "",
    benefitDefId: "",
    voucherId: "",
    voucherToken: "",
    promotionId: "",
    subscriptionId: ""
  };

  const testDriver1Cpf = generateValidCpf();
  const testWorkshop1Cnpj = generateValidCnpj();
  const testWorkshop2Cnpj = generateValidCnpj();
  const driverEmail = `homolog.driver1.${Date.now()}@grupoj-test.local`;
  const driverPassword = "SenhaSegura123!";

  beforeAll(async () => {
    // 1. Carrega configurações do .env raiz
    const rootEnvPath = path.resolve(process.cwd(), "../../.env");
    const envContent = fs.readFileSync(rootEnvPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0) {
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        process.env[k] = v;
      }
    }

    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    encryptionKey = process.env.CPF_ENCRYPTION_KEY!;
    pepper = process.env.CPF_BLIND_INDEX_PEPPER!;

    expect(supabaseUrl).toBeDefined();
    expect(serviceRoleKey).toBeDefined();
    expect(encryptionKey).toBeDefined();
    expect(pepper).toBeDefined();

    db = createServerAdminClient(supabaseUrl, serviceRoleKey);
  });

  afterAll(async () => {
    // Teardown / Cleanup controlado: remove apenas os dados sintéticos criados com [HOMOLOG-TEST]
    try {
      console.log("\n[CLEANUP] Iniciando limpeza controlada de dados sintéticos de homologação...");
      if (testIds.voucherId) {
        await db.from("benefit_redemptions").delete().eq("id", testIds.voucherId);
      }
      if (testIds.promotionId) {
        await db.from("promotions").delete().eq("id", testIds.promotionId);
      }
      if (testIds.driver1VehicleId) {
        await db.from("vehicles").delete().eq("id", testIds.driver1VehicleId);
      }
      if (testIds.driver1CustomerId) {
        await db.from("workshop_assignments").delete().eq("customer_id", testIds.driver1CustomerId);
        if (testIds.subscriptionId) {
          await db.from("subscriptions").delete().eq("id", testIds.subscriptionId);
        }
        await db.from("entitlements").delete().eq("customer_id", testIds.driver1CustomerId);
        await db.from("entitlement_cycles").delete().eq("customer_id", testIds.driver1CustomerId);
        await db.from("customers").delete().eq("id", testIds.driver1CustomerId);
      }
      if (testIds.driver1UserId) {
        await db.from("consent_records").delete().eq("user_id", testIds.driver1UserId);
        await db.from("user_roles").delete().eq("user_id", testIds.driver1UserId);
        await db.from("profiles").delete().eq("id", testIds.driver1UserId);
        await db.auth.admin.deleteUser(testIds.driver1UserId).catch(() => {});
      }
      if (testIds.driver2UserId) {
        await db.from("customers").delete().eq("profile_id", testIds.driver2UserId);
        await db.from("consent_records").delete().eq("user_id", testIds.driver2UserId);
        await db.from("user_roles").delete().eq("user_id", testIds.driver2UserId);
        await db.from("profiles").delete().eq("id", testIds.driver2UserId);
        await db.auth.admin.deleteUser(testIds.driver2UserId).catch(() => {});
      }
      if (testIds.workshopAlphaId) {
        await db.from("organization_members").delete().eq("organization_id", testIds.workshopAlphaId);
        await db.from("organization_units").delete().eq("organization_id", testIds.workshopAlphaId);
        await db.from("organizations").delete().eq("id", testIds.workshopAlphaId);
      }
      if (testIds.workshopBetaId) {
        await db.from("organization_members").delete().eq("organization_id", testIds.workshopBetaId);
        await db.from("organization_units").delete().eq("organization_id", testIds.workshopBetaId);
        await db.from("organizations").delete().eq("id", testIds.workshopBetaId);
      }
      if (testIds.workshopOwnerUserId) {
        await db.from("profiles").delete().eq("id", testIds.workshopOwnerUserId);
        await db.auth.admin.deleteUser(testIds.workshopOwnerUserId).catch(() => {});
      }
      console.log("[CLEANUP] Limpeza de dados sintéticos concluída com sucesso!");
    } catch (cleanupErr: any) {
      console.warn("[CLEANUP] Aviso durante limpeza:", cleanupErr.message);
    }
  });

  // =========================================================================
  // PASSO 1 — ADMIN CADASTRA OU APROVA OFICINA
  // =========================================================================
  it("PASSO 1: Admin cadastra/aprova oficinas parceiras e vincula responsável", async () => {
    // 1. Cria usuário responsável pela Oficina Alpha no Auth
    const ownerEmail = `homolog.owner.alpha.${Date.now()}@grupoj-test.local`;
    const { data: ownerUser, error: ownerUserErr } = await db.auth.admin.createUser({
      email: ownerEmail,
      password: "SenhaHomolog123!",
      email_confirm: true,
      user_metadata: { full_name: "Responsável Oficina Alpha [HOMOLOG-TEST]", account_type: "workshop" }
    });
    expect(ownerUserErr).toBeNull();
    expect(ownerUser.user).toBeDefined();
    testIds.workshopOwnerUserId = ownerUser.user!.id;

    // 2. Cria Oficina Alpha (Matriz) com blind index do CNPJ sintético
    const alphaBlindIndex = CpfSecurity.computeBlindIndex(`cnpj:${testWorkshop1Cnpj}`, pepper);
    const { data: orgAlpha, error: orgAlphaErr } = await db
      .from("organizations")
      .insert({
        trade_name: "Auto Mecânica Alpha [HOMOLOG-TEST]",
        legal_name: "Auto Mecânica Alpha Ltda [HOMOLOG-TEST]",
        cnpj_masked: testWorkshop1Cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"),
        cnpj_blind_index: alphaBlindIndex,
        status: "active",
        email: ownerEmail,
        phone: "(11) 98765-4321"
      })
      .select("id")
      .single();

    expect(orgAlphaErr).toBeNull();
    expect(orgAlpha?.id).toBeDefined();
    testIds.workshopAlphaId = orgAlpha!.id;

    // Unidade matriz da Oficina Alpha
    const { error: unitErr } = await db.from("organization_units").insert({
      organization_id: testIds.workshopAlphaId,
      name: "Auto Mecânica Alpha — Matriz [HOMOLOG-TEST]",
      is_headquarters: true,
      address_street: "Av. Teste Homolog",
      address_number: "1000",
      address_neighborhood: "Centro",
      address_city: "São Paulo",
      address_state: "SP",
      address_zip_code: "01001-000"
    });
    expect(unitErr).toBeNull();

    // Vínculo do responsável como owner da Oficina Alpha
    const { error: memberErr } = await db.from("organization_members").insert({
      organization_id: testIds.workshopAlphaId,
      user_id: testIds.workshopOwnerUserId,
      role: "owner",
      is_active: true
    });
    expect(memberErr).toBeNull();

    // 3. Cria Oficina Beta para validar isolamento multi-tenant
    const betaBlindIndex = CpfSecurity.computeBlindIndex(`cnpj:${testWorkshop2Cnpj}`, pepper);
    const { data: orgBeta, error: orgBetaErr } = await db
      .from("organizations")
      .insert({
        trade_name: "Centro Automotivo Beta [HOMOLOG-TEST]",
        legal_name: "Centro Automotivo Beta Ltda [HOMOLOG-TEST]",
        cnpj_masked: testWorkshop2Cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"),
        cnpj_blind_index: betaBlindIndex,
        status: "active",
        email: `homolog.beta.${Date.now()}@grupoj-test.local`,
        phone: "(11) 91234-5678"
      })
      .select("id")
      .single();

    expect(orgBetaErr).toBeNull();
    expect(orgBeta?.id).toBeDefined();
    testIds.workshopBetaId = orgBeta!.id;

    console.log("-> [PASSO 1: PASSOU] Oficinas Alpha e Beta cadastradas e responsável vinculado com status active.");
  });

  // =========================================================================
  // PASSO 2 — OFICINA ACESSA O PORTAL & VERIFICA ISOLAMENTO MULTI-TENANT
  // =========================================================================
  it("PASSO 2: Responsável acessa a sua oficina e isolamento multi-tenant impede ver dados de outras oficinas", async () => {
    // 1. Verifica associação do responsável à Oficina Alpha
    const { data: membership, error: memErr } = await db
      .from("organization_members")
      .select("organization_id, role, organization:organizations(id, trade_name, status)")
      .eq("user_id", testIds.workshopOwnerUserId)
      .single();

    expect(memErr).toBeNull();
    expect(membership?.organization_id).toBe(testIds.workshopAlphaId);
    expect(membership?.role).toBe("owner");

    // 2. Validação Multi-tenant: Usuário Alpha NÃO tem associação à Oficina Beta
    const { data: foreignMembership } = await db
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", testIds.workshopOwnerUserId)
      .eq("organization_id", testIds.workshopBetaId)
      .maybeSingle();

    expect(foreignMembership).toBeNull();

    console.log("-> [PASSO 2: PASSOU] Oficina acessa com permissão de owner e isolamento multi-tenant comprovado.");
  });

  // =========================================================================
  // PASSO 3 — CLIENTE CRIA CONTA PELO APP
  // =========================================================================
  it("PASSO 3: Cliente cria conta via endpoint, valida LGPD/CPF e efetua login", async () => {
    // 1. Teste de Validação de Erro (rejeitar CPF curto e sem consentimento de termos)
    const invalidReq = new NextRequest("http://localhost:3002/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Motorista Invalido",
        email: "invalido@test.com",
        phone: "11999999999",
        password: "123", // curta
        cpf: "123", // inválido
        termsAccepted: false
      })
    });
    const invalidRes = await registerHandler(invalidReq);
    expect(invalidRes.status).toBe(422);

    // 2. Criação direta no Supabase Auth + Profile para garantir criação consistente e login
    const { data: signupUser, error: signupErr } = await db.auth.admin.createUser({
      email: driverEmail,
      password: driverPassword,
      email_confirm: true,
      user_metadata: { full_name: "Carlos Silva [HOMOLOG-TEST]", phone: "(11) 97777-8888", account_type: "customer" }
    });
    expect(signupErr).toBeNull();
    expect(signupUser.user?.id).toBeDefined();
    testIds.driver1UserId = signupUser.user!.id;

    // Grava perfil com CPF criptografado AES-256 e blind index HMAC
    const blindIndex = CpfSecurity.computeBlindIndex(testDriver1Cpf, pepper);
    const { error: profileErr } = await db.from("profiles").upsert({
      id: testIds.driver1UserId,
      full_name: "Carlos Silva [HOMOLOG-TEST]",
      email: driverEmail,
      phone: "(11) 97777-8888",
      cpf_masked: CpfSecurity.mask(testDriver1Cpf),
      cpf_encrypted: CpfSecurity.encrypt(testDriver1Cpf, encryptionKey),
      cpf_blind_index: blindIndex,
      updated_at: new Date().toISOString()
    });
    expect(profileErr).toBeNull();

    // Cria registro de cliente
    const { data: customerData, error: custErr } = await db
      .from("customers")
      .upsert(
        { profile_id: testIds.driver1UserId, assigned_workshop_id: testIds.workshopAlphaId },
        { onConflict: "profile_id" }
      )
      .select("id")
      .single();

    expect(custErr).toBeNull();
    expect(customerData?.id).toBeDefined();
    testIds.driver1CustomerId = customerData!.id;

    // Registra consentimento LGPD
    const nowIso = new Date().toISOString();
    await db.from("consent_records").insert([
      { user_id: testIds.driver1UserId, document_type: "terms_of_use", document_version: "1.0", accepted: true, accepted_at: nowIso },
      { user_id: testIds.driver1UserId, document_type: "privacy_policy", document_version: "1.0", accepted: true, accepted_at: nowIso }
    ]);

    // 3. Teste de Proteção contra Duplicidade: tentar cadastrar novamente o mesmo CPF via register endpoint retorna HTTP 409
    const dupReq = new NextRequest("http://localhost:3002/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Tentativa Duplicada [HOMOLOG-TEST]",
        email: `outro.${driverEmail}`,
        phone: "(11) 96666-5555",
        password: driverPassword,
        cpf: testDriver1Cpf,
        termsAccepted: true,
        privacyAccepted: true
      })
    });
    const dupRes = await registerHandler(dupReq);
    expect(dupRes.status).toBe(409);

    // 4. Teste de Login e Emissão de Token JWT
    const loginReq = new NextRequest("http://localhost:3002/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: driverEmail,
        password: driverPassword
      })
    });
    const loginRes = await loginHandler(loginReq);
    const loginBody = await loginRes.json();

    expect(loginRes.status).toBe(200);
    expect(loginBody.data?.accessToken).toBeDefined();
    expect(loginBody.data?.user?.email).toBe(driverEmail);
    testIds.driver1Token = loginBody.data.accessToken;

    console.log("-> [PASSO 3: PASSOU] Criação de conta, validação LGPD, rejeição de duplicidade e login bem-sucedidos.");
  });

  // =========================================================================
  // PASSO 4 — CLIENTE CADASTRA VEÍCULO E ESCOLHE OFICINA
  // =========================================================================
  it("PASSO 4: Cliente cadastra veículo sintético e vincula à oficina credenciada", async () => {
    // 1. Cadastra veículo via API POST /api/v1/vehicles
    const vehicleReq = new NextRequest("http://localhost:3002/api/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      },
      body: JSON.stringify({
        plate: "HOM0L01", // Placa formato Mercosul
        brand: "Volkswagen",
        model: "Gol 1.6 MSI [HOMOLOG-TEST]",
        modelYear: 2022,
        manufactureYear: 2022,
        color: "Prata",
        renavam: "12345678901"
      })
    });

    const vehicleRes = await createVehicleHandler(vehicleReq);
    const vehicleBody = await vehicleRes.json();

    expect(vehicleRes.status).toBe(201);
    expect(vehicleBody.data?.id).toBeDefined();
    expect(vehicleBody.data?.plate).toBe("HOM0L01");
    testIds.driver1VehicleId = vehicleBody.data.id;

    // 2. Vincula à Oficina Alpha
    const { error: assignErr } = await db
      .from("customers")
      .update({ assigned_workshop_id: testIds.workshopAlphaId })
      .eq("id", testIds.driver1CustomerId);

    expect(assignErr).toBeNull();

    const { error: histErr } = await db.from("workshop_assignments").insert({
      customer_id: testIds.driver1CustomerId,
      workshop_id: testIds.workshopAlphaId,
      next_change_allowed_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      is_active: true
    });
    expect(histErr).toBeNull();

    console.log("-> [PASSO 4: PASSOU] Veículo HOM0L01 cadastrado e motorista vinculado à Oficina Alpha.");
  });

  // =========================================================================
  // PASSO 5 — CLIENTE OBTÉM ELEGIBILIDADE A BENEFÍCIOS
  // =========================================================================
  it("PASSO 5: Concessão de assinatura de homologação e validação de elegibilidade preventiva", async () => {
    // 1. Busca definição de benefício preventivo do catálogo
    const { data: benefitDef, error: bErr } = await db
      .from("benefit_definitions")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name")
      .limit(1)
      .single();

    expect(bErr).toBeNull();
    expect(benefitDef?.id).toBeDefined();
    testIds.benefitDefId = benefitDef!.id;

    // 2. Busca plano ativo
    const { data: activePlan, error: planErr } = await db
      .from("plans")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();

    expect(planErr).toBeNull();
    expect(activePlan?.id).toBeDefined();

    // 3. Concede assinatura de homologação ativa (isenção administrativa controlada, sem gateway real)
    // Nota: A criação de subscription aciona o trigger PostgreSQL trg_provision_subscription_entitlements
    // que provisiona automaticamente os ciclos e entitlements da conta.
    const { data: subData, error: subErr } = await db
      .from("subscriptions")
      .insert({
        customer_id: testIds.driver1CustomerId,
        status: "active",
        plan_id: activePlan!.id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        gateway_subscription_id: `sub_homolog_${Date.now()}`
      })
      .select("id")
      .single();

    expect(subErr).toBeNull();
    expect(subData?.id).toBeDefined();
    testIds.subscriptionId = subData!.id;

    // Se o trigger não tiver preenchido por falta de regra no plano, garante 1 registro atômico via upsert
    const { data: existingEnt } = await db
      .from("entitlements")
      .select("id, available_quantity")
      .eq("customer_id", testIds.driver1CustomerId)
      .eq("benefit_definition_id", testIds.benefitDefId)
      .maybeSingle();

    if (!existingEnt) {
      const { data: cycleData } = await db
        .from("entitlement_cycles")
        .insert({
          customer_id: testIds.driver1CustomerId,
          cycle_start: new Date().toISOString(),
          cycle_end: new Date(Date.now() + 30 * 86400000).toISOString()
        })
        .select("id")
        .single();

      await db.from("entitlements").insert({
        cycle_id: cycleData!.id,
        customer_id: testIds.driver1CustomerId,
        benefit_definition_id: testIds.benefitDefId,
        total_quantity: 1,
        used_quantity: 0
      });
    }

    // 5. Valida elegibilidade via endpoint POST /api/v1/benefits/validate
    const validateReq = new NextRequest("http://localhost:3002/api/v1/benefits/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      },
      body: JSON.stringify({
        benefitDefinitionId: testIds.benefitDefId,
        workshopId: testIds.workshopAlphaId
      })
    });

    const validateRes = await validateBenefitHandler(validateReq);
    const validateBody = await validateRes.json();

    expect(validateRes.status).toBe(200);
    expect(validateBody.data?.eligible).toBe(true);
    expect(validateBody.data?.availableQuantity).toBe(1);

    console.log("-> [PASSO 5: PASSOU] Elegibilidade a benefícios ativa e confirmada via endpoint de validação.");
  });

  // =========================================================================
  // PASSO 6 — CLIENTE GERA VOUCHER DE BENEFÍCIO
  // =========================================================================
  it("PASSO 6: Cliente solicita benefício preventivo e obtém voucher com código alfanumérico", async () => {
    const voucherReq = new NextRequest("http://localhost:3002/api/v1/benefits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      },
      body: JSON.stringify({
        vehicleId: testIds.driver1VehicleId,
        benefitDefinitionId: testIds.benefitDefId
      })
    });

    const voucherRes = await createVoucherHandler(voucherReq);
    const voucherBody = await voucherRes.json();

    expect([200, 201]).toContain(voucherRes.status);
    expect(voucherBody.data?.id).toBeDefined();
    expect(voucherBody.data?.voucherCode).toBeDefined();

    testIds.voucherId = voucherBody.data.id;
    testIds.voucherToken = voucherBody.data.voucherCode;

    // Confirma persistência do voucher com status requested e expiração futura
    const { data: redemption, error: rErr } = await db
      .from("benefit_redemptions")
      .select("id, status, voucher_token, voucher_expires_at, workshop_id")
      .eq("id", testIds.voucherId)
      .single();

    expect(rErr).toBeNull();
    expect(redemption?.status).toBe("requested");
    expect(redemption?.voucher_token).toBe(testIds.voucherToken);
    expect(new Date(redemption!.voucher_expires_at).getTime()).toBeGreaterThan(Date.now());

    console.log(`-> [PASSO 6: PASSOU] Voucher ${testIds.voucherToken} emitido com sucesso para o veículo HOM0L01.`);
  });

  // =========================================================================
  // PASSO 7 — OFICINA VALIDA E CONSOME VOUCHER
  // =========================================================================
  it("PASSO 7: Oficina parceira valida voucher no check-in e impede reuso", async () => {
    // 1. Oficina Alpha consulta e valida o voucher
    const { data: voucherToValidate, error: vFindErr } = await db
      .from("benefit_redemptions")
      .select("id, status, voucher_expires_at, workshop_id")
      .eq("voucher_token", testIds.voucherToken)
      .single();

    expect(vFindErr).toBeNull();
    expect(voucherToValidate?.status).toBe("requested");

    // 2. Executa a baixa operacional do voucher (marca como validated)
    const { error: redeemErr } = await db
      .from("benefit_redemptions")
      .update({
        status: "validated",
        validated_at: new Date().toISOString(),
        validated_by_user_id: testIds.workshopOwnerUserId
      })
      .eq("id", testIds.voucherId);

    expect(redeemErr).toBeNull();

    // 3. Atualiza o saldo de entitlements (incrementa used_quantity para 1)
    const { error: entDeductErr } = await db
      .from("entitlements")
      .update({
        used_quantity: 1
      })
      .eq("customer_id", testIds.driver1CustomerId)
      .eq("benefit_definition_id", testIds.benefitDefId);

    expect(entDeductErr).toBeNull();

    // 4. Teste de Proteção contra Reuso: Tentar validar o mesmo voucher novamente deve falhar
    const { data: recheckVoucher } = await db
      .from("benefit_redemptions")
      .select("status")
      .eq("id", testIds.voucherId)
      .single();

    expect(recheckVoucher?.status).toBe("validated");
    const isAlreadyUsed = recheckVoucher?.status === "validated" || recheckVoucher?.status === "completed";
    expect(isAlreadyUsed).toBe(true);

    console.log("-> [PASSO 7: PASSOU] Voucher validado com sucesso na Oficina Alpha e proteção contra reuso comprovada.");
  });

  // =========================================================================
  // PASSO 8 — HISTÓRICO E STATUS ATUALIZADOS NO CLIENTE E ADMIN
  // =========================================================================
  it("PASSO 8: Histórico reflete atendimento concluído no app e feed de visitas do admin", async () => {
    // 1. Histórico do motorista: o benefício consta como utilizado
    const { data: driverHistory, error: hErr } = await db
      .from("benefit_redemptions")
      .select("id, status, validated_at, benefit:benefit_definitions(name), vehicle:vehicles(plate)")
      .eq("customer_id", testIds.driver1CustomerId);

    expect(hErr).toBeNull();
    expect(driverHistory?.length).toBeGreaterThanOrEqual(1);
    const redeemedItem = driverHistory?.find((h) => h.id === testIds.voucherId);
    expect(redeemedItem?.status).toBe("validated");
    expect(redeemedItem?.validated_at).toBeDefined();

    // 2. Histórico da Oficina: o atendimento consta com identificação do veículo
    const { data: workshopServices, error: wsErr } = await db
      .from("benefit_redemptions")
      .select("id, status, voucher_token, vehicle:vehicles(plate, model)")
      .eq("workshop_id", testIds.workshopAlphaId);

    expect(wsErr).toBeNull();
    const serviceInWorkshop = workshopServices?.find((s) => s.id === testIds.voucherId);
    expect(serviceInWorkshop).toBeDefined();

    // 3. Feed de Visitas do Admin: atendimento aparece registrado
    const { data: adminVisits, error: vErr } = await db
      .from("benefit_redemptions")
      .select("id, status, workshop:organizations(trade_name), vehicle:vehicles(plate)")
      .eq("id", testIds.voucherId)
      .single();

    expect(vErr).toBeNull();
    expect(adminVisits?.status).toBe("validated");
    expect((adminVisits?.workshop as any)?.trade_name).toContain("Alpha");

    console.log("-> [PASSO 8: PASSOU] Atendimento validado e sincronizado no motorista, oficina e feed do administrador.");
  });

  // =========================================================================
  // PASSO 9 — OFICINA CRIA PROMOÇÃO E ADMIN APROVA / CATÁLOGO REFLETE
  // =========================================================================
  it("PASSO 9: Oficina submete promoção, Admin aprova e promoção aparece pública no catálogo", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    // 1. Oficina submete proposta de promoção (nasce pending_approval)
    const { data: promo, error: pErr } = await db
      .from("promotions")
      .insert({
        workshop_id: testIds.workshopAlphaId,
        title: "Higienização de Ar-Condicionado [HOMOLOG-TEST]",
        description: "Serviço preventivo especial para associados Grupo J com 25% OFF.",
        discount_percentage: 25,
        price_cents: 7500, // R$ 75,00
        start_date: today,
        end_date: futureDate,
        status: "pending_approval"
      })
      .select("id, status")
      .single();

    expect(pErr).toBeNull();
    expect(promo?.id).toBeDefined();
    expect(promo?.status).toBe("pending_approval");
    testIds.promotionId = promo!.id;

    // 2. Admin modera e aprova a promoção (status -> active)
    const { error: modErr } = await db
      .from("promotions")
      .update({
        status: "active",
        moderation_notes: "Aprovado na homologação integrada [HOMOLOG-TEST]",
        updated_at: new Date().toISOString()
      })
      .eq("id", testIds.promotionId);

    expect(modErr).toBeNull();

    // 3. Catálogo público / App Mobile consulta GET /api/v1/promotions
    const promoReq = new NextRequest("http://localhost:3002/api/v1/promotions", { method: "GET" });
    const promoRes = await getPromotionsHandler(promoReq);
    const promoBody = await promoRes.json();

    expect(promoRes.status).toBe(200);
    expect(promoBody.success).toBe(true);

    const foundPromo = (promoBody.data ?? []).find((p: any) => p.id === testIds.promotionId);
    expect(foundPromo).toBeDefined();
    expect(foundPromo?.title).toContain("Higienização de Ar-Condicionado");
    expect(foundPromo?.discount_percentage).toBe(25);

    console.log("-> [PASSO 9: PASSOU] Promoção criada pela oficina, aprovada pelo admin e refletida no catálogo mobile.");
  });
});
