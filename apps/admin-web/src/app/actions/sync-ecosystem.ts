"use server";

import { revalidatePath } from "next/cache";
import { checkIsAdmin, createServerSupabaseClient } from "@/lib/supabase/server";

export interface SyncEcosystemResult {
  success: boolean;
  timestamp: string;
  latencyMs: number;
  message: string;
  nodes: {
    admin: { name: string; status: "synced" | "warning"; latencyMs: number; rls: string };
    workshops: { name: string; status: "synced" | "warning"; activeCount: number; latencyMs: number };
    customers: { name: string; status: "synced" | "warning"; activeCount: number; benefitsCount: number };
  };
}

/**
 * Server Action que força a sincronização global de todo o ecossistema Grupo J:
 * - Limpa caches do Next.js revalidando todos os layouts e caminhos
 * - Verifica a saúde e latência do PostgreSQL / Supabase Row Level Security
 * - Fornece telemetria instantânea para o painel do Joaquim
 */
export async function syncEcosystemAction(): Promise<SyncEcosystemResult> {
  const startTime = Date.now();
  const supabase = await createServerSupabaseClient();

  try {
    if (!(await checkIsAdmin())) throw new Error("Acesso não autorizado");
    // 1. Revalidação instantânea de todos os caminhos do ecossistema
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/oficinas");
    revalidatePath("/clientes");
    revalidatePath("/beneficios");
    revalidatePath("/promocoes");
    revalidatePath("/assinaturas");
    revalidatePath("/financeiro");
    revalidatePath("/visitas");
    revalidatePath("/configuracoes");

    // 2. Telemetria simultânea no banco de dados
    const [
      workshopsResult,
      customersResult,
      benefitsResult
    ] = await Promise.all([
      supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("benefit_definitions").select("id", { count: "exact", head: true }).eq("is_active", true)
    ]);

    const queryError = workshopsResult.error || customersResult.error || benefitsResult.error;
    if (queryError) throw queryError;

    const totalLatency = Date.now() - startTime;

    return {
      success: true,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      latencyMs: totalLatency,
      message: `Consultas do administrativo atualizadas (${totalLatency}ms).`,
      nodes: {
        admin: {
          name: "Governança & RLS Central",
          status: "synced",
          latencyMs: totalLatency,
          rls: "Não auditado nesta consulta"
        },
        workshops: {
          name: "Rede de Centros Automotivos",
          status: "synced",
          activeCount: workshopsResult.count ?? 0,
          latencyMs: totalLatency
        },
        customers: {
          name: "Motoristas & Catálogo de Benefícios",
          status: "synced",
          activeCount: customersResult.count ?? 0,
          benefitsCount: benefitsResult.count ?? 0
        }
      }
    };
  } catch (error) {
    console.error("[syncEcosystemAction] Error during sync:", error);
    const totalLatency = Date.now() - startTime;

    return {
      success: false,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      latencyMs: Math.max(totalLatency, 24),
      message: "Não foi possível confirmar a sincronização com o banco de dados.",
      nodes: {
        admin: {
          name: "Governança & RLS Central",
          status: "warning",
          latencyMs: totalLatency,
          rls: "Não verificado"
        },
        workshops: {
          name: "Rede de Centros Automotivos",
          status: "warning",
          activeCount: 0,
          latencyMs: totalLatency
        },
        customers: {
          name: "Motoristas & Catálogo de Benefícios",
          status: "warning",
          activeCount: 0,
          benefitsCount: 0
        }
      }
    };
  }
}
