import { NextRequest } from "next/server";
import { createSuccessResponse } from "@/lib/response";
import { mockWorkshop } from "@grupo-j/test-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const workshops = [
    mockWorkshop,
    {
      ...mockWorkshop,
      id: "40000000-0000-0000-0000-000000000002",
      addressStreet: "Avenida das Américas",
      addressNumber: "18000",
      addressNeighborhood: "Recreio dos Bandeirantes",
      ratingAverage: 4.85,
      ratingCount: 92
    }
  ];

  return createSuccessResponse(workshops, 200, {
    total: workshops.length,
    filteredByCity: city || "all"
  });
}
