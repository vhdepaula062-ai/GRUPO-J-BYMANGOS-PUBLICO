import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@grupo-j/types";
import { getAdminDatabase } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  let database: "up" | "down" = "down";
  let storage: "up" | "down" = "down";
  try {
    const db = getAdminDatabase();
    const [databaseResult, storageResult] = await Promise.all([
      db.from("plans").select("id", { head: true, count: "exact" }).limit(1),
      db.storage.listBuckets()
    ]);
    database = databaseResult.error ? "down" : "up";
    storage = storageResult.error ? "down" : "up";
  } catch {
    // A resposta degradada informa a indisponibilidade sem expor configuração.
  }
  const status = database === "up" && storage === "up" ? "healthy" : database === "up" ? "degraded" : "unhealthy";
  return NextResponse.json({ status, version: "0.2.0", timestamp: new Date().toISOString(), environment: process.env.APP_ENV || process.env.NODE_ENV || "development", services: { database, storage } }, { status: status === "unhealthy" ? 503 : 200, headers: { "Cache-Control": "no-store, max-age=0" } });
}
