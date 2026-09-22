import { createHmac, createCipheriv, createDecipheriv, randomBytes } from "crypto";

export class CpfSecurity {
  public static assertProtectionKeys(key: string | undefined, pepper: string | undefined): void {
    const safe = (value: string | undefined) => !!value && /^[0-9a-f]{64}$/i.test(value) && !/^(.{16})\1{3}$/.test(value);
    if (!safe(key) || !safe(pepper) || key === pepper) throw new Error("Proteção de documentos indisponível: configure segredos exclusivos.");
  }
  /**
   * Remove caracteres não numéricos.
   */
  public static normalize(cpfRaw: string): string {
    return cpfRaw.replace(/\D/g, "");
  }

  /**
   * Gera representação mascarada para exibição em interfaces de atendimento (LGPD).
   * Ex: "123.456.789-00" -> "***.456.789-**"
   */
  public static mask(cpfRaw: string): string {
    const clean = this.normalize(cpfRaw);
    if (clean.length !== 11) {
      return "***.***.***-**";
    }
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  }

  /**
   * Calcula o Blind Index usando HMAC-SHA256 para buscas exatas e garantia de unicidade
   * sem expor o CPF em texto claro no banco de dados.
   */
  public static computeBlindIndex(cpfRaw: string, pepper: string): string {
    const clean = this.normalize(cpfRaw);
    return createHmac("sha256", pepper).update(clean).digest("hex");
  }

  /**
   * Criptografa o CPF com AES-256-GCM para armazenamento seguro.
   */
  public static encrypt(cpfRaw: string, keyHex: string): string {
    const clean = this.normalize(cpfRaw);
    const key = Buffer.from(keyHex, "hex");
    const iv = randomBytes(12); // 96 bits IV para GCM
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(clean, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    // Formato: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  /**
   * Decifra o CPF previamente gravado em AES-256-GCM.
   */
  public static decrypt(cipherText: string, keyHex: string): string {
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      throw new Error("Formato de CPF criptografado inválido.");
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = Buffer.from(keyHex, "hex");
    const iv = Buffer.from(ivHex as string, "hex");
    const authTag = Buffer.from(authTagHex as string, "hex");

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex as string, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
