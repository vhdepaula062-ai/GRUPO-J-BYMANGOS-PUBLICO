import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("deve retornar 200 OK com status 'healthy' e timestamp UTC", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.version).toBe("0.1.0");
    expect(body.timestamp).toBeDefined();
    expect(body.services.database).toBe("up");
    expect(body.services.storage).toBe("up");
  });
});
