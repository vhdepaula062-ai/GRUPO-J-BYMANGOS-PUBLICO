import { NextResponse } from "next/server";
import { ProblemDetails } from "@grupo-j/types";
import { defaultLogger } from "@grupo-j/observability";

export function createSuccessResponse<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    },
    { status }
  );
}

export function createProblemResponse(problem: ProblemDetails) {
  defaultLogger.warn("API Problem Details retornada", { problem });

  return NextResponse.json(problem, {
    status: problem.status,
    headers: {
      "Content-Type": "application/problem+json"
    }
  });
}
