import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminNavbar } from "@/components/AdminNavbar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <AdminNavbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
