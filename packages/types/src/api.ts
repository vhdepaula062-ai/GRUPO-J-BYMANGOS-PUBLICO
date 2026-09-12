export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
    totalCount?: number;
  };
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  requestId?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  environment: string;
  services: {
    database: "up" | "down";
    storage: "up" | "down";
  };
}
