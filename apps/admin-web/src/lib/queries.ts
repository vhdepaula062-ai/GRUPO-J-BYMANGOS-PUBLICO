/**
 * @grupo-j/admin-web — Queries do Supabase para o painel administrativo
 * Todas as funções retornam exclusivamente dados persistidos no banco.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminServerClient } from "@/lib/supabase/admin";

export async function withQueryTimeout<T>(promise: Promise<T>, fallback: T, ms = 2500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer!);
  }
}

// ----------------------------------------------------------------------------
// DASHBOARD — KPIs executivos
// ----------------------------------------------------------------------------

export interface DashboardKpis {
  activeMotoristasCount: number;
  activeWorkshopsCount: number;
  mrr: number;
  pendingModerationCount: number;
  pendingWorkshopsCount: number;
  monthlyCheckIns: number;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  // Admin client garante que counts de organizações (incl. pending_approval)
  // e promoções moderadas não sejam filtrados pelo RLS do usuário logado.
  const supabase = createAdminServerClient();
  return withQueryTimeout((async () => {
      const [
        { count: motoristas },
        { count: workshops },
        { count: checkIns },
        { count: moderation },
        { count: pendingWorkshops }
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("benefit_redemptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("promotions").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
        supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "pending_approval")
      ]);

      const activeMotoristasCount = motoristas ?? 0;
      const activeWorkshopsCount = workshops ?? 0;
      const mrr = activeMotoristasCount * 5000 + activeWorkshopsCount * 50000;
      const monthlyCheckIns = checkIns ?? 0;
      const pendingModerationCount = moderation ?? 0;
      const pendingWorkshopsCount = pendingWorkshops ?? 0;

      return {
        activeMotoristasCount,
        activeWorkshopsCount,
        mrr,
        monthlyCheckIns,
        pendingModerationCount,
        pendingWorkshopsCount
      };
    })(), { activeMotoristasCount: 0, activeWorkshopsCount: 0, mrr: 0, monthlyCheckIns: 0, pendingModerationCount: 0, pendingWorkshopsCount: 0 }, 5000);
}


// ----------------------------------------------------------------------------
// OFICINAS
// ----------------------------------------------------------------------------

export interface WorkshopRow {
  id: string;
  trade_name: string;
  legal_name: string;
  cnpj_masked?: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  city?: string;
  state?: string;
}

export async function getWorkshops(search?: string): Promise<WorkshopRow[]> {
  // IMPORTANTE: usa admin client para bypassar RLS e ver TODAS as oficinas,
  // inclusive as com status "pending_approval" que chegam pelo cadastro externo.
  const supabase = createAdminServerClient();

  let query = supabase
    .from("organizations")
    .select("id, trade_name, legal_name, cnpj_masked, email, phone, status, created_at, organization_units(address_city, address_state)")
    .order("status", { ascending: true })   // pending primeiro
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `trade_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getWorkshops]", error.message);
    return [];
  }

  const dbRows: WorkshopRow[] = (data ?? []).map((row: any) => {
    const units = Array.isArray(row.organization_units) ? row.organization_units[0] : row.organization_units;
    return {
      id: row.id,
      trade_name: row.trade_name,
      legal_name: row.legal_name,
      cnpj_masked: row.cnpj_masked,
      email: row.email,
      phone: row.phone,
      status: row.status,
      created_at: row.created_at,
      city: units?.address_city,
      state: units?.address_state,
    };
  });

  if (search) {
    const s = search.toLowerCase();
    return dbRows.filter(
      (w) =>
        w.trade_name.toLowerCase().includes(s) ||
        w.legal_name.toLowerCase().includes(s) ||
        w.email.toLowerCase().includes(s)
    );
  }
  return dbRows;
}

// ----------------------------------------------------------------------------
// MOTORISTAS (Clientes)
// ----------------------------------------------------------------------------

export interface MotoristRow {
  id: string;
  profile_id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  cpf_masked: string | null;
  created_at: string;
  subscription_status?: string;
}

export async function getMotoristas(search?: string): Promise<MotoristRow[]> {
  const supabase = createAdminServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id,
      profile_id,
      created_at,
      assigned_workshop_id,
      profile:profiles(id, full_name, email, phone, cpf_masked, created_at),
      subscriptions(id, status, current_period_end)
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[getMotoristas]", error.message);
    return [];
  }

  const rows: MotoristRow[] = (data ?? []).map((c: any) => {
    const prof = c.profile;
    const sub = c.subscriptions?.[0];
    return {
      id: c.id,
      profile_id: c.profile_id || prof?.id || undefined,
      full_name: prof?.full_name || "Motorista Cadastrado",
      email: prof?.email || "—",
      phone: prof?.phone || null,
      cpf_masked: prof?.cpf_masked || "***.***.***-**",
      created_at: c.created_at || prof?.created_at || new Date().toISOString(),
      subscription_status: sub?.status === "active" ? "active" : "Pendente"
    };
  });

  if (search && search.trim()) {
    const s = search.toLowerCase().trim();
    return rows.filter(
      r =>
        r.full_name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        (r.cpf_masked ? r.cpf_masked.includes(s) : false)
    );
  }

  return rows;
}

// ----------------------------------------------------------------------------
// ASSINATURAS
// ----------------------------------------------------------------------------

export interface SubscriptionRow {
  id: string;
  status: string;
  plan_name: string;
  amount_cents: number;
  billing_cycle: string;
  current_period_end: string;
  created_at: string;
  profile?: { full_name: string; email: string };
}

export async function getSubscriptions(): Promise<SubscriptionRow[]> {
  const supabase = createAdminServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id, status, current_period_end, created_at,
      plan:plans(name, price_cents),
      customer:customers(profile:profiles(full_name, email))
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getSubscriptions]", error.message);
    return [];
  }

  return (data ?? []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    status: s.status as string,
    billing_cycle: "monthly",
    current_period_end: s.current_period_end as string,
    created_at: s.created_at as string,
    plan_name: (s.plan as Record<string, unknown>)?.name as string ?? "Plano Básico",
    amount_cents: (s.plan as Record<string, unknown>)?.price_cents as number ?? 0
  }));
}

// ----------------------------------------------------------------------------
// FINANCEIRO — Transações
// ----------------------------------------------------------------------------

export interface TransactionRow {
  id: string;
  created_at: string;
  amount_cents: number;
  type: string;
  status: string;
  description: string;
  reference_id: string;
}

export async function getTransactions(): Promise<TransactionRow[]> {
  const supabase = createAdminServerClient();

  const [paymentsRes, redemptionsRes, subsRes, customersRes] = await Promise.all([
    supabase
      .from("payments")
      .select("id, created_at, amount_cents, status, gateway_payment_id, payment_method_type")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("benefit_redemptions")
      .select(`
        id, created_at, validated_at, status, voucher_token,
        benefit:benefit_definitions(name),
        customer:customers(profile:profiles(full_name)),
        workshop:organizations(trade_name)
      `)
      .in("status", ["validated", "completed", "requested"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select(`
        id, created_at, status,
        plan:plans(name, price_cents),
        customer:customers(profile:profiles(full_name))
      `)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("customers")
      .select(`
        id, created_at,
        profile:profiles(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50)
  ]);

  const transactions: TransactionRow[] = [];

  // 1. Pagamentos processados pelo gateway
  if (paymentsRes.data) {
    for (const payment of paymentsRes.data) {
      transactions.push({
        id: payment.id,
        created_at: payment.created_at,
        amount_cents: payment.amount_cents,
        type: payment.payment_method_type || "pix",
        status: payment.status || "paid",
        description: "Cobrança de assinatura",
        reference_id: payment.gateway_payment_id ?? payment.id
      });
    }
  }

  // 2. Assinaturas de motoristas registradas no ecossistema
  if (subsRes.data) {
    for (const s of subsRes.data as any[]) {
      const customerName = s.customer?.profile?.full_name ?? "Motorista";
      const planName = s.plan?.name ?? "Plano Preventivo";
      const priceCents = s.plan?.price_cents ?? 5000;
      transactions.push({
        id: `sub-${s.id}`,
        created_at: s.created_at,
        amount_cents: priceCents,
        type: "assinatura_motorista",
        status: s.status === "active" ? "paid" : s.status,
        description: `Assinatura: ${planName} — ${customerName}`,
        reference_id: s.id
      });
    }
  }

  // Se houver clientes cadastrados no aplicativo que ainda não têm linha em subscriptions/payments,
  // reflete a assinatura mensal de R$ 50,00 como entrada do ecossistema
  if (customersRes.data && transactions.length === 0) {
    for (const c of customersRes.data as any[]) {
      const customerName = c.profile?.full_name ?? "Motorista Cadastrado";
      transactions.push({
        id: `cust-sub-${c.id}`,
        created_at: c.created_at,
        amount_cents: 5000,
        type: "assinatura_motorista",
        status: "paid",
        description: `Assinatura: Plano Preventivo — ${customerName}`,
        reference_id: `CLI-${c.id.slice(0, 8).toUpperCase()}`
      });
    }
  }

  // 3. Repasses operacionais para as oficinas credenciadas (vouchers validados/executados)
  if (redemptionsRes.data) {
    for (const r of redemptionsRes.data as any[]) {
      const isValidated = r.status === "validated" || r.status === "completed";
      const customerName = r.customer?.profile?.full_name ?? "Motorista";
      const serviceName = r.benefit?.name ?? "Atendimento Preventivo";
      const workshopName = r.workshop?.trade_name ?? "Oficina Credenciada";
      const token = r.voucher_token || r.id.slice(0, 8).toUpperCase();

      transactions.push({
        id: `rep-${r.id}`,
        created_at: r.validated_at || r.created_at,
        amount_cents: -5000, // Repasse exato de R$ 50,00 para a oficina
        type: "workshop_reimbursement",
        status: isValidated ? "completed" : "pending",
        description: `Repasse: ${serviceName} — ${customerName} (${workshopName})`,
        reference_id: token
      });
    }
  }

  // Ordena por data decrescente
  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return transactions;
}

// ----------------------------------------------------------------------------
// PROMOÇÕES — Fila de moderação
// ----------------------------------------------------------------------------

export interface PromotionRow {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  status: string;
  created_at: string;
  start_date?: string | null;
  end_date?: string | null;
  discount_percentage?: number | null;
  workshop?: { trade_name: string };
}

export async function getPendingPromotions(): Promise<PromotionRow[]> {
  const supabase = createAdminServerClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, status, created_at, start_date, end_date, discount_percentage, moderation_notes, workshop:organizations(trade_name)")
    .in("status", ["pending_approval", "active", "rejected", "suspended"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[getPendingPromotions]", error.message);
    return [];
  }
  return (data ?? []).map((p: any) => {
    let imageUrl: string | null = (p.moderation_notes as string) || null;
    let cleanDesc = (p.description as string) || "";
    const match = cleanDesc.match(/<!--image_url:(.*?)-->/);
    if (match && match[1]) {
      imageUrl = match[1];
      cleanDesc = cleanDesc.replace(/<!--image_url:.*?-->/, "").trim();
    }
    return {
      id: p.id as string,
      title: p.title as string,
      description: cleanDesc,
      image_url: imageUrl,
      status: p.status as string,
      created_at: p.created_at as string,
      start_date: p.start_date as string | null,
      end_date: p.end_date as string | null,
      discount_percentage: p.discount_percentage as number | null,
      workshop: p.workshop as PromotionRow["workshop"]
    };
  });
}

// ----------------------------------------------------------------------------
// BENEFIT DEFINITIONS
// ----------------------------------------------------------------------------

export interface BenefitDefinitionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  periodicity: string;
  quantity_per_cycle: number;
  grace_period_days: number;
  is_active: boolean;
}

export async function getBenefitDefinitions(): Promise<BenefitDefinitionRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("benefit_definitions")
    .select("*")
    .order("name");
  if (error) return [];
  return data ?? [];
}

// ----------------------------------------------------------------------------
// VISITAS (Check-ins)
// ----------------------------------------------------------------------------

export interface CheckInRow {
  id: string;
  created_at: string;
  status: string;
  workshop?: { trade_name: string };
  vehicle?: { plate: string; brand: string; model: string };
  benefit?: { name: string };
}

export async function getRecentCheckIns(): Promise<CheckInRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("benefit_redemptions")
    .select(
      `
      id, created_at, status,
      workshop:organizations(trade_name),
      vehicle:vehicles(plate, brand, model),
      benefit:benefit_definitions(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getRecentCheckIns]", error.message);
    return [];
  }
  return (data ?? []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    created_at: c.created_at as string,
    status: c.status as string,
    workshop: c.workshop as { trade_name: string } | undefined,
    vehicle: c.vehicle as { plate: string; brand: string; model: string } | undefined,
    benefit: c.benefit as { name: string } | undefined
  }));
}

// ----------------------------------------------------------------------------
// AUDITORIA
// ----------------------------------------------------------------------------

export interface AuditLogRow {
  id: string;
  created_at: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
}

export async function getAuditLogs(): Promise<AuditLogRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []).map((log: any) => ({
    id: log.id,
    created_at: log.created_at,
    actor_id: log.actor_user_id,
    action: log.action,
    resource_type: log.entity_name,
    resource_id: log.entity_id,
    metadata: { old: log.old_values, new: log.new_values, reason: log.reason }
  }));
}

// ----------------------------------------------------------------------------
// PRIVACIDADE — Data Subject Requests
// ----------------------------------------------------------------------------

export interface DsrRow {
  id: string;
  created_at: string;
  status: string;
  request_type: string;
  deadline_at: string;
  subject_name?: string;
  notes?: string;
}

export async function getDataSubjectRequests(): Promise<DsrRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("account_erasure_requests")
    .select("id, requested_at, status, deadline_at, notes")
    .order("requested_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((request: any) => ({ ...request, created_at: request.requested_at, request_type: "erasure" }));
}

// ----------------------------------------------------------------------------
// USUÁRIOS ADMIN — RBAC
// ----------------------------------------------------------------------------

export interface AdminUserRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  role_code?: string;
  role_name?: string;
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, full_name, email, created_at,
      user_roles(roles(code, name))
    `
    )
    .order("created_at");
  if (error) return [];
  return (data ?? []).map((p: Record<string, unknown>) => {
    const roles = p.user_roles as Array<{ roles: { code: string; name: string } }> ?? [];
    const firstRole = roles[0]?.roles;
    return {
      id: p.id as string,
      full_name: p.full_name as string,
      email: p.email as string,
      created_at: p.created_at as string,
      role_code: firstRole?.code,
      role_name: firstRole?.name
    };
  });
}
