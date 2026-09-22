import { createHash } from "node:crypto";
/**
 * @grupo-j/workshop-web — Queries do Supabase para o portal da oficina
 * O usuário logado é sempre associado a uma organização via user_roles.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAuthorizedWorkshopClient } from "@/lib/supabase/authorized";

// Busca a organização vinculada ao usuário autenticado
export async function getMyWorkshop() {
  const supabase = await createServerSupabaseClient();

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
      .eq("is_active", true)
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
  const supabase = await createServerSupabaseClient();

  try {
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [linkedResult, checkinsResult, pendingResult, subscriptionResult] = await Promise.all([
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("assigned_workshop_id", workshopId),
      supabase
        .from("benefit_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshopId)
        .eq("status", "completed")
        .gte("completed_at", currentMonthStart),
      supabase
        .from("benefit_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("workshop_id", workshopId)
        .eq("status", "requested")
        .gt("voucher_expires_at", new Date().toISOString()),
      supabase
        .from("subscriptions")
        .select("status, trial_end")
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
      subscriptionStatus: subscriptionResult.data?.trial_end && new Date(subscriptionResult.data.trial_end).getTime() > Date.now() ? "trial" : subscriptionResult.data?.status ?? "none",
      pendingAppointments: pendingResult.count ?? 0
    };
  } catch (error) {
    console.error("[getWorkshopKpis] Consulta indisponível");
    throw new Error("Não foi possível consultar os indicadores da oficina.");
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
  const supabase = await createServerSupabaseClient();

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
    .in("status", ["validated", "in_progress", "completed"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error("Não foi possível consultar os atendimentos.");
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
  const supabase = await createServerSupabaseClient();

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
  const supabase = await createAuthorizedWorkshopClient(workshopId);

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
  const adminDb = await createAuthorizedWorkshopClient(workshopId);

  // Current assignment is the sole authority for operational customer access.
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
  const db = await createAuthorizedWorkshopClient(workshopId);
  const [current,legacy] = await Promise.all([
    db.from("appointments").select("id,customer_name,customer_phone,vehicle_info,service_type,appointment_date,shift,status,notes").eq("workshop_id",workshopId).order("appointment_date",{ascending:false}),
    db.from("remote_configurations").select("value").eq("key",`appointments:${workshopId}`).maybeSingle()
  ]);
  if (current.error || legacy.error) throw new Error("Não foi possível consultar a agenda.");
  const items = new Map<string,AppointmentRow>();
  for (const row of Array.isArray(legacy.data?.value) ? legacy.data.value as AppointmentRow[] : []) {
    const h=createHash("md5").update(`${workshopId}:${row.id}`).digest("hex");
    const id=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
    items.set(id,{...row,id});
  }
  for (const row of current.data ?? []) items.set(row.id,{id:row.id,customerName:row.customer_name,phone:row.customer_phone ?? "",vehicle:row.vehicle_info ?? "",service:row.service_type,date:row.appointment_date,shift:row.shift as AppointmentRow["shift"],status:row.status as AppointmentRow["status"],notes:row.notes ?? undefined});
  return Array.from(items.values()).sort((a,b)=>b.date.localeCompare(a.date));
}
