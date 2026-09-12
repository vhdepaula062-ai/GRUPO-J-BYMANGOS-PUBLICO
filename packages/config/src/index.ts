import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["development", "test", "preview", "staging", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("http://localhost:54321"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10).default("dummy-anon-key-local-development-environment"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

  // URLs
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3002"),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_WORKSHOP_URL: z.string().url().default("http://localhost:3001"),

  // Gateway de Pagamento
  PAYMENT_GATEWAY_PROVIDER: z.enum(["fake", "mercadopago"]).default("fake"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),

  // Criptografia e Blind Index de CPF (32 bytes hex = 64 chars)
  CPF_ENCRYPTION_KEY: z
    .string()
    .length(64, "CPF_ENCRYPTION_KEY deve ser uma chave hex de 32 bytes (64 caracteres)")
    .default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
  CPF_BLIND_INDEX_PEPPER: z
    .string()
    .length(64, "CPF_BLIND_INDEX_PEPPER deve ser uma chave hex de 32 bytes (64 caracteres)")
    .default("fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"),

  SESSION_SECRET: z.string().min(32).default("minimo-32-caracteres-para-assinatura-de-sessao-segura-grupo-j")
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.format();
    throw new Error(
      `FALHA NA VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE: ${JSON.stringify(errorDetails, null, 2)}`
    );
  }

  parsedEnv = result.data;
  return parsedEnv;
}
