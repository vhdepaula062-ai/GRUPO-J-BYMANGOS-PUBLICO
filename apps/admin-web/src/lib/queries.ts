import { maskCompanyDocument, safeSearchTerm } from "@grupo-j/domain";
/**
 * @grupo-j/admin-web — Queries do Supabase para o painel administrativo
 * Todas as funções retornam exclusivamente dados persistidos no banco.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAuthorizedAdminClient } from "@/lib/supabase/authorized";
import { getFinancialSnapshot, readFinancialRows } from "@/lib/financial-data";

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
  const supabase = await createAuthorizedAdminClient();
  return (async () => {
      const [
        { count: motoristas, error: motoristasError },
        { count: workshops, error: workshopsError },
        { count: checkIns, error: checkInsError },
        { count: moderation, error: moderationError },
        { count: pendingWorkshops, error: pendingError }
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

      if (motoristasError || workshopsError || checkInsError || moderationError || pendingError) {
        throw new Error("Não foi possível confirmar os indicadores da plataforma");
      }
      const activeMotoristasCount = motoristas ?? 0;
      const activeWorkshopsCount = workshops ?? 0;
      const subscriptions = await readFinancialRows("subscriptions", "id, status, trial_end, current_period_start, current_period_end, plan:plans(price_cents, currency, billing_interval_months)");
      const now = Date.now();
      const mrr = Math.round(subscriptions.filter(s => s.status === "active" && new Date(s.current_period_start).getTime() <= now && new Date(s.current_period_end).getTime() > now && (!s.trial_end || new Date(s.trial_end).getTime() <= now)).reduce((total, s) => {
        if (!s.plan || s.plan.currency !== "BRL" || s.plan.billing_interval_months < 1) throw new Error("Plano financeiro inválido");
        return total + s.plan.price_cents / s.plan.billing_interval_months;
      }, 0));
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
    })();
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
  search = search ? safeSearchTerm(search) : undefined;
  // IMPORTANTE: usa admin client para bypassar RLS e ver TODAS as oficinas,
  // inclusive as com status "pending_approval" que chegam pelo cadastro externo.
  const supabase = await createAuthorizedAdminClient();

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
      cnpj_masked: maskCompanyDocument(row.cnpj_masked),
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
  const supabase = await createAuthorizedAdminClient();

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id,
      profile_id,
      created_at,
      assigned_workshop_id,
      profile:profiles(id, full_name, email, phone, cpf_masked, created_at),
      subscriptions(id, status, created_at, trial_end, current_period_end)
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
    const sub = c.subscriptions?.slice().sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))[0];
    return {
      id: c.id,
      profile_id: c.profile_id || prof?.id || undefined,
      full_name: prof?.full_name || "Motorista Cadastrado",
      email: prof?.email || "—",
      phone: prof?.phone || null,
      cpf_masked: prof?.cpf_masked || "***.***.***-**",
      created_at: c.created_at || prof?.created_at || new Date().toISOString(),
      subscription_status: !sub ? "none" : sub.status === "active" && new Date(sub.current_period_end).getTime() <= Date.now() ? "expired" : sub.status === "active" && sub.trial_end && new Date(sub.trial_end).getTime() > Date.now() ? "trial" : sub.status
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
  const rows = await readFinancialRows("subscriptions", "id, status, trial_end, current_period_end, created_at, plan:plans(name, price_cents, billing_interval_months), customer:customers(profile:profiles(full_name, email)), organization:organizations(trade_name, email)");
  return rows.map(s => ({
    id: s.id, status: s.trial_end && new Date(s.trial_end).getTime() > Date.now() ? "trial" : s.status,
    billing_cycle: String(s.plan?.billing_interval_months ?? "—") + " mês(es)",
    current_period_end: s.current_period_end, created_at: s.created_at,
    plan_name: s.plan?.name ?? "Plano indisponível", amount_cents: s.plan?.price_cents ?? 0,
    profile: s.organization ? { full_name: s.organization.trade_name, email: s.organization.email } : s.customer?.profile
  })).sort((a, b) => b.created_at.localeCompare(a.created_at));
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
  return (await getFinancialSnapshot()).transactions;
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
  const supabase = await createAuthorizedAdminClient();

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
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
