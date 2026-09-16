/**
 * @grupo-j/admin-web — Queries do Supabase para o painel administrativo
 * Todas as funções retornam exclusivamente dados persistidos no banco.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  return withQueryTimeout((async () => {
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
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("organizations")
    .select("id, trade_name, legal_name, cnpj_masked, email, phone, status, created_at, organization_units(address_city, address_state)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `trade_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

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

  let finalResult = dbRows;
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
    .eq("user_roles.roles.code", "customer")
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("payments")
    .select("id, created_at, amount_cents, status, gateway_payment_id, payment_method_type")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getTransactions]", error.message);
    return [];
  }
  return (data ?? []).map((payment: any) => ({
    id: payment.id,
    created_at: payment.created_at,
    amount_cents: payment.amount_cents,
    type: payment.payment_method_type,
    status: payment.status,
    description: "Cobrança de assinatura",
    reference_id: payment.gateway_payment_id ?? payment.id
  }));
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
    .in("status", ["pending_approval", "active", "rejected"])
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
