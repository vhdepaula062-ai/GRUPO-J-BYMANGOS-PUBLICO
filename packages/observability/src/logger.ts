import { DataSanitizer } from "@grupo-j/security";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  action?: string;
  [key: string]: unknown;
}

export class Logger {
  private readonly context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  public withContext(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data: data ? DataSanitizer.sanitizeObject(data) : undefined
    };

    const serialized = JSON.stringify(entry);

    switch (level) {
      case "error":
        console.error(serialized);
        break;
      case "warn":
        console.warn(serialized);
        break;
      default:
        console.info(serialized);
    }
  }

  public info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  public error(message: string, error?: unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error
      ? { ...data, errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { ...data, rawError: error };

    this.log("error", message, errorData as Record<string, unknown>);
  }
}

export const defaultLogger = new Logger({ service: "grupo-j-core" });
