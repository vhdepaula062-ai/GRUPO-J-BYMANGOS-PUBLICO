/**
 * @grupo-j/admin-web — Queries do Supabase para o painel administrativo
 * Todas as funções retornam dados reais do banco + metadata para fallback visual.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { readEcosystemWorkshops } from "@grupo-j/database";

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
  const supabase = createServerSupabaseClient();
  const ecoWorkshops = readEcosystemWorkshops();
  const ecoPendingCount = ecoWorkshops.filter((w) => w.status === "pending_approval").length;
  const ecoActiveCount = ecoWorkshops.filter((w) => w.status === "active").length;

  const fallbackKpis: DashboardKpis = {
    activeMotoristasCount: 0,
    activeWorkshopsCount: ecoActiveCount,
    mrr: ecoActiveCount * 50000,
    monthlyCheckIns: 0,
    pendingModerationCount: 0,
    pendingWorkshopsCount: ecoPendingCount
  };

  return withQueryTimeout(
    (async () => {
      const [
        { count: motoristas },
        { count: workshops },
        { count: checkIns },
        { count: moderation },
        { count: pendingWorkshops }
      ] = await Promise.all([
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("benefit_redemptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("promotions").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
        supabase.from("organizations").select("*", { count: "exact", head: true }).eq("status", "pending_approval")
      ]);

      const activeMotoristasCount = motoristas ?? 0;
      const activeWorkshopsCount = (workshops ?? 0) > 0 ? workshops! : ecoActiveCount;
      const mrr = activeMotoristasCount * 5000 + activeWorkshopsCount * 50000;
      const monthlyCheckIns = checkIns ?? 0;
      const pendingModerationCount = moderation ?? 0;
      // Garante que o contador de pendentes do ecossistema seja considerado se o Supabase não tiver retornado
      const pendingWorkshopsCount = (pendingWorkshops ?? 0) > 0 ? pendingWorkshops! : ecoPendingCount;

      return {
        activeMotoristasCount,
        activeWorkshopsCount,
        mrr,
        monthlyCheckIns,
        pendingModerationCount,
        pendingWorkshopsCount
      };
    })(),
    fallbackKpis,
    2500
  );
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

export const DEFAULT_INITIAL_WORKSHOPS: WorkshopRow[] = [
  {
    id: "ws-pending-001",
    trade_name: "Auto Center Estrela do Sul",
    legal_name: "Estrela do Sul Reparações Mecânicas Ltda",
    cnpj_masked: "28.492.103/0001-44",
    email: "contato@estreladosul.com.br",
    phone: "(11) 98451-2290",
    status: "pending_approval",
    created_at: new Date().toISOString(),
    city: "São Paulo",
    state: "SP"
  },
  {
    id: "ws-active-001",
    trade_name: "Auto Mecânica Bandeirantes",
    legal_name: "Bandeirantes Motores e Peças Ltda",
    cnpj_masked: "14.238.990/0001-52",
    email: "financeiro@mecanicabandeirantes.com.br",
    phone: "(11) 3456-7890",
    status: "active",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    city: "Campinas",
    state: "SP"
  }
];

export async function getWorkshops(search?: string): Promise<WorkshopRow[]> {
  const supabase = createServerSupabaseClient();
  const ecoWorkshops = readEcosystemWorkshops();
  const ecoList: WorkshopRow[] = ecoWorkshops.map((w) => ({
    id: w.id,
    trade_name: w.trade_name,
    legal_name: w.legal_name,
    cnpj_masked: w.cnpj_masked,
    email: w.email,
    phone: w.phone,
    status: w.status,
    created_at: w.created_at,
    city: w.city,
    state: w.state
  }));

  let query = supabase
    .from("organizations")
    .select("id, trade_name, legal_name, cnpj_masked, email, phone, status, created_at, organization_units(city, state)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `trade_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    let list = ecoList.length > 0 ? ecoList : DEFAULT_INITIAL_WORKSHOPS;
    if (search) {
      const s = search.toLowerCase();
      return list.filter(
        (w) =>
          w.trade_name.toLowerCase().includes(s) ||
          w.legal_name.toLowerCase().includes(s) ||
          w.email.toLowerCase().includes(s)
      );
    }
    return list;
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
      city: units?.city,
      state: units?.state,
    };
  });

  // Mescla sem duplicação de ID
  const dbIds = new Set(dbRows.map((r) => r.id));
  const merged = [...dbRows];
  for (const eco of ecoList) {
    if (!dbIds.has(eco.id)) {
      merged.push(eco);
    }
  }

  let finalResult = merged;
  if (search) {
    const s = search.toLowerCase();
    finalResult = finalResult.filter(
      (w) =>
        w.trade_name.toLowerCase().includes(s) ||
        w.legal_name.toLowerCase().includes(s) ||
        w.email.toLowerCase().includes(s)
    );
  }
  return finalResult;
}

// ----------------------------------------------------------------------------
// MOTORISTAS (Clientes)
// ----------------------------------------------------------------------------

export interface MotoristRow {
  id: string;
  full_name: string;
  email: string;
  cpf_masked: string | null;
  created_at: string;
  subscription_status?: string;
}

export async function getMotoristas(search?: string): Promise<MotoristRow[]> {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("profiles")
    .select(
      `
      id, full_name, email, cpf_masked, created_at,
      user_roles!inner(roles!inner(code))
    `
    )
    .eq("user_roles.roles.code", "driver")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query.limit(100);
  if (error) {
    // Tabela user_roles pode não ter dados — retornar vazio sem crash
    console.error("[getMotoristas]", error.message);
    return [];
  }
  return (data ?? []) as MotoristRow[];
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id, status, billing_cycle, current_period_end, created_at,
      plan:plans(name, amount_cents),
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
    billing_cycle: s.billing_cycle as string,
    current_period_end: s.current_period_end as string,
    created_at: s.created_at as string,
    plan_name: (s.plan as Record<string, unknown>)?.name as string ?? "Plano Básico",
    amount_cents: (s.plan as Record<string, unknown>)?.amount_cents as number ?? 5000
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("payment_transactions")
    .select("id, created_at, amount_cents, type, status, description, reference_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getTransactions]", error.message);
    return [];
  }
  return data ?? [];
}

// ----------------------------------------------------------------------------
// PROMOÇÕES — Fila de moderação
// ----------------------------------------------------------------------------

export interface PromotionRow {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  workshop?: { trade_name: string };
}

export async function getPendingPromotions(): Promise<PromotionRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, status, created_at, organization:organizations(trade_name)")
    .in("status", ["pending_review", "approved", "rejected"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getPendingPromotions]", error.message);
    return [];
  }
  return (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    title: p.title as string,
    description: p.description as string,
    status: p.status as string,
    created_at: p.created_at as string,
    workshop: p.organization as { trade_name: string } | undefined
  }));
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
    .from("audit_log_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return data ?? [];
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
    .from("data_subject_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
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
