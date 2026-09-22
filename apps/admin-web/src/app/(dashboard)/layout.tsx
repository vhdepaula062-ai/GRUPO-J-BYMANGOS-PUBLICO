import React from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { checkIsAdmin } from "@/lib/supabase/server";
import { FinancialRefresh } from "@/components/FinancialRefresh";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    redirect("/login?error=unauthorized");
  }

  return <AdminShell><FinancialRefresh />{children}</AdminShell>;
}
