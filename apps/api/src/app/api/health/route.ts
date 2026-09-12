import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@grupo-j/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const healthData: HealthCheckResponse = {
    status: "healthy",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "up",
      storage: "up"
    }
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
