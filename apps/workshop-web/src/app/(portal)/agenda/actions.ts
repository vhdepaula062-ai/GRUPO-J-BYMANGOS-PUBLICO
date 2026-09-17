"use server";

import { createAdminServerClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { AppointmentRow } from "@/lib/queries";

export async function createAppointmentAction(
  workshopId: string,
  appointmentData: Omit<AppointmentRow, "id">
): Promise<{ success: boolean; appointment?: AppointmentRow; error?: string }> {
  try {
    const supabase = createAdminServerClient();
    const configKey = `appointments:${workshopId}`;

    // 1. Busca agendamentos existentes
    const { data: existing } = await supabase
      .from("remote_configurations")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();

    const currentList: AppointmentRow[] = (existing?.value as AppointmentRow[]) || [];

    const newAppointment: AppointmentRow = {
      id: `apt-${Date.now()}`,
      ...appointmentData
    };

    const updatedList = [newAppointment, ...currentList];

    // 2. Salva a lista atualizada
    const { error } = await supabase
      .from("remote_configurations")
      .upsert(
        {
          key: configKey,
          value: updatedList,
          description: `Agendamentos operacionais da oficina ${workshopId}`,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("[createAppointmentAction] Erro ao salvar:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/agenda");
    return { success: true, appointment: newAppointment };
  } catch (err: unknown) {
    console.error("[createAppointmentAction] Erro inesperado:", err);
    return { success: false, error: err instanceof Error ? err.message : "Erro ao agendar." };
  }
}

export async function deleteAppointmentAction(
  workshopId: string,
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminServerClient();
    const configKey = `appointments:${workshopId}`;

    const { data: existing } = await supabase
      .from("remote_configurations")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();

    const currentList: AppointmentRow[] = (existing?.value as AppointmentRow[]) || [];
    const updatedList = currentList.filter((a) => a.id !== appointmentId);

    const { error } = await supabase
      .from("remote_configurations")
      .upsert(
        {
          key: configKey,
          value: updatedList,
          description: `Agendamentos operacionais da oficina ${workshopId}`,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agenda");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao excluir." };
  }
}

export async function updateAppointmentStatusAction(
  workshopId: string,
  appointmentId: string,
  status: AppointmentRow["status"]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminServerClient();
    const configKey = `appointments:${workshopId}`;

    const { data: existing } = await supabase
      .from("remote_configurations")
      .select("value")
      .eq("key", configKey)
      .maybeSingle();

    const currentList: AppointmentRow[] = (existing?.value as AppointmentRow[]) || [];
    const updatedList = currentList.map((a) =>
      a.id === appointmentId ? { ...a, status } : a
    );

    const { error } = await supabase
      .from("remote_configurations")
      .upsert(
        {
          key: configKey,
          value: updatedList,
          description: `Agendamentos operacionais da oficina ${workshopId}`,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agenda");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Erro ao atualizar." };
  }
}
