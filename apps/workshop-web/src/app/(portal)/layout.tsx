import React from "react";
import { WorkshopSidebar } from "@/components/WorkshopSidebar";
import { WorkshopNavbar } from "@/components/WorkshopNavbar";

export default function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <WorkshopSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <WorkshopNavbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
