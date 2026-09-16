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
    headers.set("Cache-Control", "no-cache");
    headers.set("Pragma", "no-cache");
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

  public async patch<T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }

  public async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, {
      method: "DELETE"
    });
  }

  public async login<T = unknown>(identifier: string, password: string) {
    return this.post<T, { identifier: string; password: string }>("/api/v1/auth/login", { identifier, password });
  }

  public async register<T = unknown>(data: {
    fullName: string;
    email: string;
    cpf: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }) {
    return this.post<T, typeof data>("/api/v1/auth/register", data);
  }

  public async refreshSession<T = unknown>(refreshToken: string) {
    return this.post<T, { refreshToken: string }>("/api/v1/auth/refresh", { refreshToken });
  }

  public async logout<T = unknown>() {
    return this.post<T, Record<string, never>>("/api/v1/auth/logout", {});
  }

  // --- Domain Methods ---
  public async getMe<T = unknown>() {
    return this.get<T>("/api/v1/me");
  }

  public async deleteMyAccount<T = unknown>() {
    return this.delete<T>("/api/v1/me");
  }

  public async getVehicles<T = unknown>() {
    return this.get<T>("/api/v1/vehicles");
  }

  public async createVehicle<T = unknown, B = unknown>(data: B) {
    return this.post<T, B>("/api/v1/vehicles", data);
  }

  public async updateVehicle<T = unknown, B = unknown>(id: string, data: B) {
    return this.patch<T, B>(`/api/v1/vehicles/${id}`, data);
  }

  public async getWorkshops<T = unknown>() {
    return this.get<T>("/api/v1/workshops");
  }

  public async getWorkshop<T = unknown>(id: string) {
    return this.get<T>(`/api/v1/workshops/${id}`);
  }

  public async requestWorkshopChange<T = unknown>(workshopId: string) {
    return this.post<T, { workshopId: string }>("/api/v1/workshops/change-request", { workshopId });
  }

  public async getCurrentSubscription<T = unknown>() {
    return this.get<T>("/api/v1/subscriptions/current");
  }

  public async getPayments<T = unknown>() {
    return this.get<T>("/api/v1/payments");
  }

  public async getBenefits<T = unknown>() {
    return this.get<T>("/api/v1/benefits");
  }

  public async getPromotions<T = unknown>() {
    return this.get<T>("/api/v1/promotions");
  }

  public async getServiceOrders<T = unknown>() {
    return this.get<T>("/api/v1/service-orders");
  }

  public async createServiceOrder<T = unknown, B = unknown>(data: B) {
    return this.post<T, B>("/api/v1/service-orders", data);
  }

  public async validateVoucher<T = unknown, B = unknown>(data: B) {
    return this.post<T, B>("/api/v1/vouchers/validate", data);
  }
}
