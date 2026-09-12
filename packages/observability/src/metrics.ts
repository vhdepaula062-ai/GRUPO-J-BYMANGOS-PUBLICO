export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, "up" | "down">;
  timestamp: string;
}

export class HealthChecker {
  public static evaluate(checks: Record<string, "up" | "down">): HealthStatus {
    const values = Object.values(checks);
    const hasDown = values.includes("down");
    const allDown = values.length > 0 && values.every((v) => v === "down");

    let status: HealthStatus["status"] = "healthy";
    if (allDown) {
      status = "unhealthy";
    } else if (hasDown) {
      status = "degraded";
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    };
  }
}
