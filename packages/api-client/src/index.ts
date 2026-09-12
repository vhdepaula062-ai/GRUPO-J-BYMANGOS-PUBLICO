import { ProblemDetails, HealthCheckResponse, ApiResponse } from "@grupo-j/types";

export interface ApiClientConfig {
  baseUrl: string;
  getAuthToken?: () => Promise<string | null> | string | null;
}

export class ApiClientError extends Error {
  public readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = "ApiClientError";
    this.problem = problem;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAuthToken?: () => Promise<string | null> | string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.getAuthToken = config.getAuthToken;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(options.headers || {});

    headers.set("Accept", "application/json");
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let problem: ProblemDetails;
      try {
        problem = (await response.json()) as ProblemDetails;
      } catch {
        problem = {
          type: "about:blank",
          title: response.statusText || "HTTP Error",
          status: response.status,
          detail: `Falha na requisição para ${path} com status HTTP ${response.status}`
        };
      }
      throw new ApiClientError(problem);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return (await response.json()) as T;
  }

  public async getHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>("/api/health");
  }

  public async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { method: "GET" });
  }

  public async post<T, B = unknown>(path: string, body: B, idempotencyKey?: string): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return this.request<ApiResponse<T>>(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  }
}
