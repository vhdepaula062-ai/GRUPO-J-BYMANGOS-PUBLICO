import React from "react";
import { createAdminServerClient } from "@/lib/supabase/admin";
import { PrivacidadeClient, type ErasureItem } from "./PrivacidadeClient";

export const dynamic = "force-dynamic";

export default async function PrivacidadePage() {
  const supabase = createAdminServerClient();
  const { data } = await supabase
    .from("account_erasure_requests")
    .select(`
      id,
      protocol,
      user_id,
      status,
      requested_at,
      deadline_at,
      notes,
      profile:profiles(full_name, email)
    `)
    .order("requested_at", { ascending: false })
    .limit(100);

  const requests: ErasureItem[] = (data ?? []).map((r: any) => {
    const prof = Array.isArray(r.profile) ? r.profile[0] : r.profile;
    return {
      id: r.id,
      protocol: r.protocol,
      user_id: r.user_id,
      status: r.status,
      requested_at: r.requested_at,
      deadline_at: r.deadline_at,
      notes: r.notes,
      titular_name: prof?.full_name || "Titular Solicitante",
      titular_email: prof?.email || "—"
    };
  });

  return <PrivacidadeClient initialRequests={requests} />;
}
