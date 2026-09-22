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
    {
      status,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store"
      }
    }
  );
}

export function createProblemResponse(input: Pick<ProblemDetails,"type"|"title"|"status"> & {detail?:string; [key:string]:unknown}) {
  const problem:ProblemDetails={...input,detail:input.detail??input.title};
  defaultLogger.warn("API Problem Details retornada", { type: problem.type, title: problem.title, status: problem.status });

  const publicProblem = problem.status >= 500 ? { ...problem, detail: "Não foi possível concluir a operação. Tente novamente ou contate o atendimento." } : problem;
  return NextResponse.json(publicProblem, {
    status: problem.status,
    headers: {
      "Content-Type": "application/problem+json",
      "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store"
    }
  });
}
