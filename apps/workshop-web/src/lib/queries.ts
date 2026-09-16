/**
 * @grupo-j/workshop-web — Queries do Supabase para o portal da oficina
 * O usuário logado é sempre associado a uma organização via user_roles.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Busca a organização vinculada ao usuário autenticado
export async function getMyWorkshop() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

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

  if (error || !data?.organization) return null;
  return { role: data.role as string, organization: data.organization as unknown as Record<string, unknown> };
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
  valid_from?: string;
  valid_until?: string;
}

export async function getWorkshopPromotions(workshopId: string): Promise<PromotionRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, image_url, status, created_at, start_date, end_date")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
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

  if (error) return [];

  return (data ?? []).map((row: Record<string, unknown>) => {
    const cust = row.customer as Record<string, unknown> | null;
    const profile = cust?.profile as Record<string, unknown> | null;
    const vehicles = (cust?.vehicles as Array<Record<string, unknown>>) ?? [];
    const firstVehicle = vehicles[0];

    return {
      id: row.id as string,
      full_name: (profile?.full_name as string) || "Motorista Assinante",
      phone: (profile?.phone as string) || "—",
      plate: (firstVehicle?.plate as string) || "—",
      vehicle_model: firstVehicle
        ? `${firstVehicle.brand} ${firstVehicle.model}`
        : "Veículo Não Cadastrado",
      created_at: row.created_at as string
    };
  });
}
