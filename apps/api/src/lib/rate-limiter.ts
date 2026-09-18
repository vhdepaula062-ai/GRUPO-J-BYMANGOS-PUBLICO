import { NextRequest, NextResponse } from "next/server";
import { createProblemResponse } from "./response";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface WindowRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, WindowRecord>();

// Limpeza periódica de memória para evitar vazamento em execuções prolongadas
const CLEANUP_INTERVAL_MS = 60000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of cache.entries()) {
    if (now >= record.resetAt) {
      cache.delete(key);
    }
  }
}

/**
 * Extrai e higieniza o endereço IP real da requisição
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && /^[0-9a-fA-F:.]+$/.test(first)) return first;
  }

  const realIp = request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  if (realIp && /^[0-9a-fA-F:.]+$/.test(realIp)) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Validador de Rate Limit em conformidade com RFC 7807 (Problem Details).
 * Retorna null se a requisição estiver dentro do limite, ou um NextResponse (429) se excedido.
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  cleanupStaleEntries();

  const ip = getClientIp(request);
  const prefix = config.keyPrefix || "global";
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = cache.get(key);

  if (!record || now >= record.resetAt) {
    cache.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  record.count += 1;

  if (record.count > config.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

    const response = createProblemResponse({
      type: "https://api.grupoj.com.br/v1/errors/rate-limit-exceeded",
      title: "Muitas requisições",
      status: 429,
      detail: `Limite de requisições excedido. Aguarde ${retryAfterSec} segundo(s) para tentar novamente.`
    });

    response.headers.set("Retry-After", String(retryAfterSec));
    response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)));

    return response;
  }

  return null;
}
