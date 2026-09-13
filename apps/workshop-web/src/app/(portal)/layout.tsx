import React from "react";
import { WorkshopShell } from "@/components/WorkshopShell";

export default function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <WorkshopShell>{children}</WorkshopShell>;
}
