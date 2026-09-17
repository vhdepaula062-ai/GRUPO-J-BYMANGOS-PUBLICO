/**
 * @grupo-j/workshop-web — Queries do Supabase para o portal da oficina
 * O usuário logado é sempre associado a uma organização via user_roles.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminServerClient } from "@/lib/supabase/admin";

// Busca a organização vinculada ao usuário autenticado
export async function getMyWorkshop() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
        role,
        organization:organizations(
          id, trade_name, legal_name, email, phone, status, created_at
        )
      `
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data?.organization) {
      return { role: data.role as string, organization: data.organization as unknown as Record<string, unknown> };
    }
  }

  return null;
}

// KPIs da oficina: clientes vinculados, atendimentos do mês, assinatura
export interface WorkshopKpis {
  linkedCustomers: number;
  monthlyCheckIns: number;
  subscriptionStatus: string;
  pendingAppointments: number;
}

export async function getWorkshopKpis(workshopId: string): Promise<WorkshopKpis> {
  const supabase = createServerSupabaseClient();

  try {
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [linkedResult, checkinsResult, pendingResult, subscriptionResult] = await Promise.all([
      supabase
        .from("workshop_assignments")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshopId)
        .eq("is_active", true),
      supabase
        .from("benefit_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshopId)
        .eq("status", "completed")
        .gte("created_at", currentMonthStart),
      supabase
        .from("benefit_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshopId)
        .in("status", ["requested", "validated"]),
      supabase
        .from("subscriptions")
        .select("status")
        .eq("organization_id", workshopId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    const queryError = linkedResult.error || checkinsResult.error || pendingResult.error || subscriptionResult.error;
    if (queryError) throw queryError;

    return {
      linkedCustomers: linkedResult.count ?? 0,
      monthlyCheckIns: checkinsResult.count ?? 0,
      subscriptionStatus: subscriptionResult.data?.status ?? "none",
      pendingAppointments: pendingResult.count ?? 0
    };
  } catch (error) {
    console.error("[getWorkshopKpis] Error fetching workshop KPIs, defaulting to 0:", error);
    return {
      linkedCustomers: 0,
      monthlyCheckIns: 0,
      subscriptionStatus: "unavailable",
      pendingAppointments: 0
    };
  }
}

// Histórico de atendimentos da oficina
export interface ServiceRow {
  id: string;
  created_at: string;
  status: string;
  voucher_token: string;
  vehicle?: { plate: string; brand: string; model: string };
  benefit?: { name: string };
  customer?: { profile?: { full_name: string } };
}

export async function getWorkshopServices(workshopId: string): Promise<ServiceRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("benefit_redemptions")
    .select(
      `
      id, created_at, status, voucher_token,
      vehicle:vehicles(plate, brand, model),
      benefit:benefit_definitions(name),
      customer:customers(profile:profiles(full_name))
    `
    )
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    created_at: s.created_at as string,
    status: s.status as string,
    voucher_token: s.voucher_token as string,
    vehicle: s.vehicle as ServiceRow["vehicle"],
    benefit: s.benefit as ServiceRow["benefit"],
    customer: s.customer as ServiceRow["customer"]
  }));
}

// Equipe da oficina (membros com acesso ao portal)
export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function getWorkshopTeam(workshopId: string): Promise<TeamMember[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      role, created_at,
      profile:profiles(id, full_name, email)
    `
    )
    .eq("organization_id", workshopId)
    .order("created_at");

  if (error) return [];
  return (data ?? []).map((m: Record<string, unknown>) => ({
    id: (m.profile as Record<string, unknown>)?.id as string ?? m.created_at as string,
    full_name: (m.profile as Record<string, unknown>)?.full_name as string ?? "—",
    email: (m.profile as Record<string, unknown>)?.email as string ?? "—",
    role: m.role as string,
    created_at: m.created_at as string
  }));
}

// Promoções da oficina
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
}

export async function getWorkshopPromotions(workshopId: string): Promise<PromotionRow[]> {
  const supabase = createAdminServerClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, status, created_at, start_date, end_date, moderation_notes, discount_percentage")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getWorkshopPromotions] error:", error.message);
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
      discount_percentage: p.discount_percentage as number | null
    };
  });
}

// Clientes vinculados à oficina
export interface WorkshopCustomerRow {
  id: string;
  full_name: string;
  phone?: string;
  plate?: string;
  vehicle_model?: string;
  created_at: string;
}

export async function getWorkshopCustomers(workshopId: string): Promise<WorkshopCustomerRow[]> {
  const adminDb = createAdminServerClient();

  // 1. Busca por vínculos na tabela workshop_assignments
  const { data: assignments } = await adminDb
    .from("workshop_assignments")
    .select(
      `
      id, created_at,
      customer:customers(
        id,
        profile:profiles(full_name, phone),
        vehicles(plate, brand, model)
      )
    `
    )
    .eq("workshop_id", workshopId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 2. Busca motoristas vinculados diretamente ou cadastrados no ecossistema
  const { data: directCustomers } = await adminDb
    .from("customers")
    .select(
      `
      id, created_at,
      profile:profiles(full_name, phone),
      vehicles(plate, brand, model)
    `
    )
    .eq("assigned_workshop_id", workshopId)
    .order("created_at", { ascending: false });

  const map = new Map<string, WorkshopCustomerRow>();

  (directCustomers ?? []).forEach((c: any) => {
    const profile = c.profile;
    const vehicles = c.vehicles ?? [];
    const firstVehicle = vehicles[0];
    map.set(c.id, {
      id: c.id,
      full_name: profile?.full_name || "Motorista Assinante",
      phone: profile?.phone || "—",
      plate: firstVehicle?.plate || "—",
      vehicle_model: firstVehicle
        ? `${firstVehicle.brand || ""} ${firstVehicle.model || ""}`.trim()
        : "Veículo Não Cadastrado",
      created_at: c.created_at || new Date().toISOString()
    });
  });

  (assignments ?? []).forEach((row: any) => {
    const cust = row.customer;
    if (!cust) return;
    const profile = cust.profile;
    const vehicles = cust.vehicles ?? [];
    const firstVehicle = vehicles[0];
    map.set(cust.id, {
      id: row.id,
      full_name: profile?.full_name || "Motorista Assinante",
      phone: profile?.phone || "—",
      plate: firstVehicle?.plate || "—",
      vehicle_model: firstVehicle
        ? `${firstVehicle.brand || ""} ${firstVehicle.model || ""}`.trim()
        : "Veículo Não Cadastrado",
      created_at: row.created_at
    });
  });

  return Array.from(map.values());
}

// ----------------------------------------------------------------------------
// AGENDAMENTOS OPERACIONAIS (AGENDA DE SERVIÇOS)
// ----------------------------------------------------------------------------

export interface AppointmentRow {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  service: string;
  date: string;
  shift: "morning" | "afternoon" | "flexible";
  status: "confirmed" | "completed" | "in_progress" | "canceled";
  notes?: string;
}

export async function getWorkshopAppointments(workshopId: string): Promise<AppointmentRow[]> {
  const adminDb = createAdminServerClient();
  const configKey = `appointments:${workshopId}`;

  const { data, error } = await adminDb
    .from("remote_configurations")
    .select("value")
    .eq("key", configKey)
    .maybeSingle();

  if (error || !data?.value || !Array.isArray(data.value)) {
    return []; // Retorna lista vazia (0 dados fictícios)
  }

  return data.value as AppointmentRow[];
}
