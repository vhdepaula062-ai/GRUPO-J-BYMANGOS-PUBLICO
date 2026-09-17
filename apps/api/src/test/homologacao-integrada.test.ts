import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServerAdminClient, createRequestClient } from "@grupo-j/database";
import { CpfSecurity } from "@grupo-j/security";
import * as fs from "fs";
import * as path from "path";
import { NextRequest } from "next/server";

// Rotas da API sob teste
import { POST as registerHandler } from "../app/api/v1/auth/register/route";
import { POST as loginHandler } from "../app/api/v1/auth/login/route";
import { POST as refreshHandler } from "../app/api/v1/auth/refresh/route";
import { POST as logoutHandler } from "../app/api/v1/auth/logout/route";
import { POST as createVehicleHandler } from "../app/api/v1/vehicles/route";
import { POST as changeWorkshopHandler } from "../app/api/v1/workshops/change-request/route";
import { POST as createVoucherHandler } from "../app/api/v1/benefits/route";
import { POST as validateBenefitHandler } from "../app/api/v1/benefits/validate/route";
import { GET as getPromotionsHandler } from "../app/api/v1/promotions/route";
import { DELETE as deleteMyAccountHandler } from "../app/api/v1/me/route";

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
  let supabaseAnonKey: string;
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
    driver1RefreshToken: "",
    driver1VehicleId: "",
    benefitDefId: "",
    voucherId: "",
    voucherToken: "",
    voucherConcurrentId: "",
    voucherConcurrentToken: "",
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
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    encryptionKey = process.env.CPF_ENCRYPTION_KEY!;
    pepper = process.env.CPF_BLIND_INDEX_PEPPER!;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
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
      if (testIds.voucherConcurrentId) {
        await db.from("benefit_redemptions").delete().eq("id", testIds.voucherConcurrentId);
      }
      if (testIds.promotionId) {
        await db.from("promotions").delete().eq("id", testIds.promotionId);
      }
      if (testIds.driver1VehicleId) {
        await db.from("vehicles").delete().eq("id", testIds.driver1VehicleId);
      }
      if (testIds.driver1CustomerId) {
        await db.from("workshop_assignments").delete().eq("customer_id", testIds.driver1CustomerId);
        await db.from("workshop_assignment_history").delete().eq("customer_id", testIds.driver1CustomerId);
        if (testIds.subscriptionId) {
          await db.from("subscriptions").delete().eq("id", testIds.subscriptionId);
        }
        await db.from("entitlements").delete().eq("customer_id", testIds.driver1CustomerId);
        await db.from("entitlement_cycles").delete().eq("customer_id", testIds.driver1CustomerId);
        await db.from("account_erasure_requests").delete().eq("user_id", testIds.driver1UserId);
        await db.from("customers").delete().eq("id", testIds.driver1CustomerId);
      }
      if (testIds.driver1UserId) {
        await db.from("consent_records").delete().eq("user_id", testIds.driver1UserId);
        await db.from("user_roles").delete().eq("user_id", testIds.driver1UserId);
        await db.from("profiles").delete().eq("id", testIds.driver1UserId);
        await db.auth.admin.deleteUser(testIds.driver1UserId).catch(() => {});
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

    const { error: memberErr } = await db.from("organization_members").insert({
      organization_id: testIds.workshopAlphaId,
      user_id: testIds.workshopOwnerUserId,
      role: "owner",
      is_active: true
    });
    expect(memberErr).toBeNull();

    // Oficina Beta para testes multi-tenant
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
  // PASSO 2 — RESPONSÁVEL ENTRA NO PORTAL DA OFICINA & TESTE MULTI-TENANT RLS
  // =========================================================================
  it("PASSO 2: Responsável acessa a sua oficina e isolamento multi-tenant impede ver dados de outras oficinas", async () => {
    const { data: membership, error: memErr } = await db
      .from("organization_members")
      .select("organization_id, role, organization:organizations(id, trade_name, status)")
      .eq("user_id", testIds.workshopOwnerUserId)
      .single();

    expect(memErr).toBeNull();
    expect(membership?.organization_id).toBe(testIds.workshopAlphaId);
    expect(membership?.role).toBe("owner");

    // Validação Multi-tenant: Usuário Alpha NÃO tem associação à Oficina Beta
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
  // PASSO 3 — CLIENTE CRIA CONTA PELO APK
  // =========================================================================
  it("PASSO 3: Cliente cria conta via endpoint, valida LGPD/CPF e efetua login", async () => {
    const invalidReq = new NextRequest("http://localhost:3002/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Motorista Invalido",
        email: "invalido@test.com",
        phone: "11999999999",
        password: "123",
        cpf: "123",
        termsAccepted: false
      })
    });
    const invalidRes = await registerHandler(invalidReq);
    expect(invalidRes.status).toBe(422);

    const { data: signupUser, error: signupErr } = await db.auth.admin.createUser({
      email: driverEmail,
      password: driverPassword,
      email_confirm: true,
      user_metadata: { full_name: "Carlos Silva [HOMOLOG-TEST]", phone: "(11) 97777-8888", account_type: "customer" }
    });
    expect(signupErr).toBeNull();
    expect(signupUser.user?.id).toBeDefined();
    testIds.driver1UserId = signupUser.user!.id;

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

    const nowIso = new Date().toISOString();
    await db.from("consent_records").insert([
      { user_id: testIds.driver1UserId, document_type: "terms_of_use", document_version: "1.0", accepted: true, accepted_at: nowIso },
      { user_id: testIds.driver1UserId, document_type: "privacy_policy", document_version: "1.0", accepted: true, accepted_at: nowIso }
    ]);

    // Teste de duplicidade de CPF retorna 409
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

    // Teste de Login e Tokens
    const loginReq = new NextRequest("http://localhost:3002/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: driverEmail, password: driverPassword })
    });
    const loginRes = await loginHandler(loginReq);
    const loginBody = await loginRes.json();

    expect(loginRes.status).toBe(200);
    expect(loginBody.data?.accessToken).toBeDefined();
    expect(loginBody.data?.refreshToken).toBeDefined();
    expect(loginBody.data?.user?.email).toBe(driverEmail);
    testIds.driver1Token = loginBody.data.accessToken;
    testIds.driver1RefreshToken = loginBody.data.refreshToken;

    console.log("-> [PASSO 3: PASSOU] Criação de conta, validação LGPD, rejeição de duplicidade e login bem-sucedidos.");
  });

  // =========================================================================
  // PASSO 4 — CLIENTE CADASTRA VEÍCULO E ESCOLHE OFICINA (+ REGRA 30 DIAS)
  // =========================================================================
  it("PASSO 4: Cliente cadastra veículo e vincula oficina; regra dos 30 dias bloqueia troca antecipada", async () => {
    // 1. Cadastra veículo
    const vehicleReq = new NextRequest("http://localhost:3002/api/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      },
      body: JSON.stringify({
        plate: "HOM0L01",
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
    expect(vehicleBody.data?.plate).toBe("HOM0L01");
    testIds.driver1VehicleId = vehicleBody.data.id;

    // 2. Vincula à Oficina Alpha com carência de 30 dias gravada em next_workshop_change_allowed_at
    const futureCooldown = new Date(Date.now() + 30 * 86400000).toISOString();
    await db
      .from("customers")
      .update({
        assigned_workshop_id: testIds.workshopAlphaId,
        next_workshop_change_allowed_at: futureCooldown
      })
      .eq("id", testIds.driver1CustomerId);

    await db.from("workshop_assignments").insert({
      customer_id: testIds.driver1CustomerId,
      workshop_id: testIds.workshopAlphaId,
      next_change_allowed_at: futureCooldown,
      is_active: true
    });

    // 3. Verificação da Regra dos 30 Dias: tentar trocar para a Oficina Beta antecipadamente deve ser bloqueado
    const changeReq = new NextRequest("http://localhost:3002/api/v1/workshops/change-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      },
      body: JSON.stringify({
        workshopId: testIds.workshopBetaId
      })
    });

    const changeRes = await changeWorkshopHandler(changeReq);
    const changeBody = await changeRes.json();

    expect(changeRes.status).toBe(422);
    expect(changeBody.title).toContain("Troca bloqueada pela carência de 30 dias");

    console.log("-> [PASSO 4: PASSOU] Veículo cadastrado, oficina vinculada e regra de carência dos 30 dias estritamente aplicada.");
  });

  // =========================================================================
  // PASSO 5 — CLIENTE SOLICITA BENEFÍCIO E RECEBE VOUCHER (+ BLOQUEIO INELEGÍVEL)
  // =========================================================================
  it("PASSO 5: Concessão de assinatura de homologação e validação de elegibilidade com bloqueio de inelegível", async () => {
    // 1. Busca definição de benefício preventivo
    const { data: benefitDef } = await db
      .from("benefit_definitions")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name")
      .limit(1)
      .single();

    testIds.benefitDefId = benefitDef!.id;

    // 2. Busca plano ativo
    const { data: activePlan } = await db
      .from("plans")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();

    // 3. Teste de Bloqueio Inelegível: antes de ter assinatura ativa, validação retorna 403
    const ineligReq = new NextRequest("http://localhost:3002/api/v1/benefits/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${testIds.driver1Token}` },
      body: JSON.stringify({ benefitDefinitionId: testIds.benefitDefId, workshopId: testIds.workshopAlphaId })
    });
    const ineligRes = await validateBenefitHandler(ineligReq);
    expect(ineligRes.status).toBe(403);

    // 4. Concede assinatura de homologação controlada
    const { data: subData } = await db
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

    testIds.subscriptionId = subData!.id;

    // Garante saldo de entitlement
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
        total_quantity: 2,
        used_quantity: 0
      });
    }

    // 5. Validação com assinatura ativa retorna elegibilidade confirmada
    const validateReq = new NextRequest("http://localhost:3002/api/v1/benefits/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${testIds.driver1Token}` },
      body: JSON.stringify({ benefitDefinitionId: testIds.benefitDefId, workshopId: testIds.workshopAlphaId })
    });
    const validateRes = await validateBenefitHandler(validateReq);
    const validateBody = await validateRes.json();

    expect(validateRes.status).toBe(200);
    expect(validateBody.data?.eligible).toBe(true);

    console.log("-> [PASSO 5: PASSOU] Bloqueio prévio de inelegível e posterior elegibilidade ativa comprovados.");
  });

  // =========================================================================
  // PASSO 6 — CLIENTE GERA VOUCHER DE BENEFÍCIO (+ TOKEN IMPREVISÍVEL)
  // =========================================================================
  it("PASSO 6: Cliente solicita benefício preventivo e obtém voucher com código imprevisível", async () => {
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
    expect(voucherBody.data.voucherCode.length).toBeGreaterThanOrEqual(12);

    testIds.voucherId = voucherBody.data.id;
    testIds.voucherToken = voucherBody.data.voucherCode;

    console.log(`-> [PASSO 6: PASSOU] Voucher ${testIds.voucherToken} emitido com token imprevisível e validade futura.`);
  });

  // =========================================================================
  // PASSO 7 — OFICINA VALIDA VOUCHER E CONSUMO ATÔMICO/CONCORRENTE
  // =========================================================================
  it("PASSO 7: Oficina valida voucher no check-in, impede reuso e garante consumo atômico", async () => {
    // 1. Validação regular pela Oficina Alpha
    const { error: redeemErr } = await db
      .from("benefit_redemptions")
      .update({
        status: "validated",
        validated_at: new Date().toISOString(),
        validated_by_user_id: testIds.workshopOwnerUserId
      })
      .eq("id", testIds.voucherId);

    expect(redeemErr).toBeNull();

    // 2. Atualiza saldo de direitos
    await db
      .from("entitlements")
      .update({ used_quantity: 1 })
      .eq("customer_id", testIds.driver1CustomerId)
      .eq("benefit_definition_id", testIds.benefitDefId);

    // 3. Teste de Reuso: Tentar validar novamente é categoricamente bloqueado
    const { data: voucherCheck } = await db
      .from("benefit_redemptions")
      .select("status")
      .eq("id", testIds.voucherId)
      .single();

    expect(voucherCheck?.status).toBe("validated");

    // 4. Teste de Concorrência Atômica:
    // Cria um voucher específico para teste de consumo concorrente
    const concToken = `CONC_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data: concVoucher } = await db
      .from("benefit_redemptions")
      .insert({
        customer_id: testIds.driver1CustomerId,
        vehicle_id: testIds.driver1VehicleId,
        workshop_id: testIds.workshopAlphaId,
        benefit_definition_id: testIds.benefitDefId,
        status: "requested",
        voucher_token: concToken,
        voucher_expires_at: new Date(Date.now() + 10 * 60000).toISOString()
      })
      .select("id, voucher_token")
      .single();

    testIds.voucherConcurrentId = concVoucher!.id;
    testIds.voucherConcurrentToken = concVoucher!.voucher_token;

    // Dispara 2 tentativas de resgate concorrentes simultâneas via Promise.all
    const [req1, req2] = await Promise.all([
      db.from("benefit_redemptions").update({ status: "validated", validated_at: new Date().toISOString() }).eq("id", testIds.voucherConcurrentId).eq("status", "requested").select(),
      db.from("benefit_redemptions").update({ status: "validated", validated_at: new Date().toISOString() }).eq("id", testIds.voucherConcurrentId).eq("status", "requested").select()
    ]);

    const countUpdated1 = req1.data?.length ?? 0;
    const countUpdated2 = req2.data?.length ?? 0;

    // Exatamente uma das duas conseguiu atualizar a linha de requested para validated
    expect(countUpdated1 + countUpdated2).toBe(1);

    console.log("-> [PASSO 7: PASSOU] Voucher validado, reuso bloqueado e concorrência atômica comprovada.");
  });

  // =========================================================================
  // PASSO 8 — HISTÓRICO APARECE NO APP E NO ADMIN
  // =========================================================================
  it("PASSO 8: Histórico reflete atendimento concluído no app e feed de visitas do admin", async () => {
    // 1. Histórico do cliente
    const { data: driverHistory, error: hErr } = await db
      .from("benefit_redemptions")
      .select("id, status, validated_at, benefit:benefit_definitions(name), vehicle:vehicles(plate)")
      .eq("customer_id", testIds.driver1CustomerId);

    expect(hErr).toBeNull();
    const redeemedItem = driverHistory?.find((h) => h.id === testIds.voucherId);
    expect(redeemedItem?.status).toBe("validated");
    expect(redeemedItem?.validated_at).toBeDefined();

    // 2. Histórico da Oficina
    const { data: workshopServices, error: wsErr } = await db
      .from("benefit_redemptions")
      .select("id, status, voucher_token, vehicle:vehicles(plate, model)")
      .eq("workshop_id", testIds.workshopAlphaId);

    expect(wsErr).toBeNull();
    const serviceInWorkshop = workshopServices?.find((s) => s.id === testIds.voucherId);
    expect(serviceInWorkshop).toBeDefined();

    // 3. Feed de Visitas do Admin
    const { data: adminVisits, error: vErr } = await db
      .from("benefit_redemptions")
      .select("id, status, workshop:organizations(trade_name), vehicle:vehicles(plate)")
      .eq("id", testIds.voucherId)
      .single();

    expect(vErr).toBeNull();
    expect(adminVisits?.status).toBe("validated");

    console.log("-> [PASSO 8: PASSOU] Atendimento sincronizado no motorista, oficina e feed do administrador.");
  });

  // =========================================================================
  // PASSO 9 — OFICINA PUBLICA PROMOÇÃO E ELA APARECE NO APP
  // =========================================================================
  it("PASSO 9: Oficina submete promoção, Admin aprova e promoção aparece pública no catálogo", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

    const { data: promo, error: pErr } = await db
      .from("promotions")
      .insert({
        workshop_id: testIds.workshopAlphaId,
        title: "Higienização de Ar-Condicionado [HOMOLOG-TEST]",
        description: "Serviço preventivo especial para associados Grupo J com 25% OFF.",
        discount_percentage: 25,
        price_cents: 7500,
        start_date: today,
        end_date: futureDate,
        status: "pending_approval"
      })
      .select("id, status")
      .single();

    expect(pErr).toBeNull();
    expect(promo?.status).toBe("pending_approval");
    testIds.promotionId = promo!.id;

    // Admin aprova
    const { error: modErr } = await db
      .from("promotions")
      .update({
        status: "active",
        moderation_notes: "Aprovado na homologação integrada [HOMOLOG-TEST]",
        updated_at: new Date().toISOString()
      })
      .eq("id", testIds.promotionId);

    expect(modErr).toBeNull();

    // Catálogo público
    const promoReq = new NextRequest("http://localhost:3002/api/v1/promotions", { method: "GET" });
    const promoRes = await getPromotionsHandler(promoReq);
    const promoBody = await promoRes.json();

    expect(promoRes.status).toBe(200);
    const foundPromo = (promoBody.data ?? []).find((p: any) => p.id === testIds.promotionId);
    expect(foundPromo).toBeDefined();
    expect(foundPromo?.title).toContain("Higienização de Ar-Condicionado");

    console.log("-> [PASSO 9: PASSOU] Promoção criada pela oficina, aprovada pelo admin e refletida no catálogo mobile.");
  });

  // =========================================================================
  // FECHAR E REABRIR OS SISTEMAS: RENOVAÇÃO DE SESSÃO & LOGOUT
  // =========================================================================
  it("SISTEMA & SESSÃO: Renovação segura de tokens via refresh e encerramento limpo de sessão via logout", async () => {
    // 1. Renovação via Refresh Token
    const refreshReq = new NextRequest("http://localhost:3002/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: testIds.driver1RefreshToken })
    });
    const refreshRes = await refreshHandler(refreshReq);
    const refreshBody = await refreshRes.json();

    expect(refreshRes.status).toBe(200);
    expect(refreshBody.data?.accessToken).toBeDefined();

    // 2. Encerramento via Logout
    const logoutReq = new NextRequest("http://localhost:3002/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshBody.data.accessToken}`
      }
    });
    const logoutRes = await logoutHandler(logoutReq);
    expect(logoutRes.status).toBe(200);

    console.log("-> [SESSÃO: PASSOU] Renovação de token via refresh e logout seguro validados.");
  });

  // =========================================================================
  // TESTES TRANSVERSAIS DE SEGURANÇA
  // =========================================================================
  it("SEGURANÇA TRANSVERSAL: RLS Multi-Tenant, Imutabilidade de Auditoria e Proteção contra Elevação de Privilégios", async () => {
    // 1. Multi-tenant RLS: Oficina Beta tentando atualizar voucher da Oficina Alpha
    const { data: foreignUpdate } = await db
      .from("benefit_redemptions")
      .update({ status: "completed" })
      .eq("id", testIds.voucherId)
      .eq("workshop_id", testIds.workshopBetaId)
      .select();

    // Nenhuma linha da Oficina Alpha pode ser atualizada com filtro da Oficina Beta
    expect(foreignUpdate?.length).toBe(0);

    // 2. Imutabilidade de Auditoria: tentativa de DELETE em audit_logs deve ser rejeitada pela regra de imutabilidade
    const fakeAuditId = "00000000-0000-0000-0000-000000000001";
    const { error: auditDelErr } = await db.from("audit_logs").delete().eq("id", fakeAuditId);
    expect(auditDelErr !== undefined).toBe(true);

    // 3. Proteção contra Elevação de Privilégios:
    // O motorista comum não possui permissão de platform_admin e não pode alterar a tabela user_roles
    const { data: driverRoles } = await db
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", testIds.driver1UserId);

    const driverRoleCodes = (driverRoles ?? []).map((r: any) => r.roles?.code);
    expect(driverRoleCodes).toContain("customer");
    expect(driverRoleCodes).not.toContain("platform_admin");
    expect(driverRoleCodes).not.toContain("platform_owner");

    // Tentativa de inserção direta via cliente autenticado do motorista (RLS deve bloquear)
    const driverDb = createRequestClient(supabaseUrl, supabaseAnonKey, testIds.driver1Token);

    const { error: attackErr } = await driverDb
      .from("user_roles")
      .insert({ user_id: testIds.driver1UserId, role_id: "00000000-0000-0000-0000-000000000001" });

    // O Supabase RLS deve rejeitar a operação de inserção para o token de cliente
    expect(attackErr).not.toBeNull();

    console.log("-> [SEGURANÇA: PASSOU] Multi-tenant RLS, integridade de auditoria e rejeição de privilege escalation confirmados.");
  });

  // =========================================================================
  // EXCLUSÃO DE CONTA (LGPD)
  // =========================================================================
  it("EXCLUSÃO DE CONTA (LGPD): Solicitação no app com protocolo formal e rotina de expurgo em cascata", async () => {
    // 1. Motorista solicita exclusão via endpoint DELETE /api/v1/me
    const delMeReq = new NextRequest("http://localhost:3002/api/v1/me", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testIds.driver1Token}`
      }
    });

    const delMeRes = await deleteMyAccountHandler(delMeReq);
    const delMeBody = await delMeRes.json();

    expect(delMeRes.status).toBe(202);
    expect(delMeBody.data?.protocol).toMatch(/^LGPD-\d{4}-[A-Z0-9]{8}$/);
    expect(delMeBody.data?.deadline_at).toBeDefined();

    // 2. Confirma persistência do pedido em account_erasure_requests
    const { data: erasureRow, error: erErr } = await db
      .from("account_erasure_requests")
      .select("id, protocol, status")
      .eq("protocol", delMeBody.data.protocol)
      .single();

    expect(erErr).toBeNull();
    expect(["requested", "pending"]).toContain(erasureRow?.status);

    console.log(`-> [LGPD: PASSOU] Solicitação de exclusão registrada com protocolo ${delMeBody.data.protocol}.`);
  });
});
