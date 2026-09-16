import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("deve informar indisponibilidade quando os serviços não estão configurados", async () => {
    const response = await GET();
    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.status).toBe("unhealthy");
    expect(body.version).toBe("0.2.0");
    expect(body.timestamp).toBeDefined();
    expect(body.services.database).toBe("down");
    expect(body.services.storage).toBe("down");
  });
});
