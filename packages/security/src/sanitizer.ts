export class DataSanitizer {
  private static readonly PAN_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
  private static readonly CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

  private static readonly SENSITIVE_KEYS = new Set([
    "password",
    "senha",
    "secret",
    "token",
    "authorization",
    "cvv",
    "pan",
    "cardnumber",
    "card_number",
    "securitycode",
    "access_token",
    "refresh_token", "accesstoken", "refreshtoken", "cpf", "cpf_encrypted", "cpf_blind_index", "cnpj", "cnpj_blind_index", "email", "phone", "telefone", "full_name", "fullname", "cookie", "set-cookie", "apikey", "api_key", "supabase_service_role_key"
  ]);

  /**
   * Sanitiza uma string ofuscando números de cartão, CVVs e CPFs.
   */
  public static sanitizeString(text: string): string {
    return text
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED_TOKEN]")
      .replace(this.PAN_REGEX, "[REDACTED_PAN]")
      .replace(this.CPF_REGEX, "[REDACTED_CPF]");
  }

  /**
   * Percorre recursivamente um objeto ou array mascarando chaves sensíveis.
   */
  public static sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      return this.sanitizeString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (this.SENSITIVE_KEYS.has(lowerKey)) {
          sanitized[key] = "[REDACTED_SECRET]";
        } else if (typeof value === "string") {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === "object" && value !== null) {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized as T;
    }

    return obj;
  }
}
