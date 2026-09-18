import { z } from "zod";

/**
 * Expressão para validar caminhos relativos estritamente seguros.
 * Deve começar com barra única '/' e não conter esquemas, barras duplas '//' ou quebras de linha.
 */
const SAFE_RELATIVE_PATH_REGEX = /^\/[a-zA-Z0-9_\-\/?=&%#.@]*$/;

/**
 * Expressão para validar Data URIs de imagens raster seguras (PNG, JPEG, WEBP, GIF).
 * Rejeita expressamente SVG para evitar vetores de script embutidos (<svg onload=...>).
 */
const SAFE_IMAGE_DATA_URI_REGEX = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/**
 * Valida se um caminho é um redirecionamento interno seguro na mesma origem.
 * Previne ataques de Open Redirect e esquemas javascript:/data:.
 */
export function isSafeRedirectPath(path: unknown, defaultFallback = "/"): string {
  if (typeof path !== "string" || !path.trim()) {
    return defaultFallback;
  }

  const trimmed = path.trim();

  // Bloqueia barras duplas, barras invertidas e protocolos
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.startsWith("\\") ||
    trimmed.includes(":") ||
    trimmed.includes("\r") ||
    trimmed.includes("\n") ||
    trimmed.includes("\0")
  ) {
    return defaultFallback;
  }

  if (!trimmed.startsWith("/")) {
    return defaultFallback;
  }

  if (!SAFE_RELATIVE_PATH_REGEX.test(trimmed)) {
    return defaultFallback;
  }

  return trimmed;
}

/**
 * Valida se uma URL usa estritamente os protocolos HTTP ou HTTPS.
 * Bloqueia javascript:, data:, vbscript:, file: e esquemas perigosos.
 */
export function isSafeHttpUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim();

  // Rejeição imediata de esquemas inline
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Valida se uma URL de imagem é estritamente segura para renderização em tags <img> ou nativas.
 * Permite HTTP/HTTPS ou Data URIs de imagens raster (PNG, JPG, WEBP, GIF).
 * Bloqueia SVG (com scripts potenciais) e qualquer protocolo perigoso.
 */
export function isSafeImageUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim();

  // Data URIs raster seguras (sem SVG)
  if (trimmed.startsWith("data:image/")) {
    return SAFE_IMAGE_DATA_URI_REGEX.test(trimmed);
  }

  return isSafeHttpUrl(trimmed);
}

/**
 * Retorna a URL sanitizada se for segura, ou null caso contrário.
 */
export function safeImageUrl(url: unknown): string | null {
  if (isSafeImageUrl(url)) {
    return (url as string).trim();
  }
  return null;
}

/**
 * Remove caracteres de controle invisíveis e bytes nulos mantendo
 * todos os caracteres legítimos (acentos PT-BR, pontuação e espaços).
 */
export function sanitizePlainText(input: unknown): string {
  if (typeof input !== "string") return "";
  // Remove bytes nulos e caracteres de controle perigosos mantendo \t, \n, \r e texto unicode
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

/**
 * Schemas Zod para uso em validações de formulários e APIs
 */
export const SafeRedirectPathSchema = z.string().transform((val) => isSafeRedirectPath(val, "/"));

export const SafeHttpUrlSchema = z.string().refine(isSafeHttpUrl, {
  message: "URL inválida ou protocolo não permitido. Utilize http:// ou https://"
});

export const SafeImageUrlSchema = z.string().refine(isSafeImageUrl, {
  message: "URL de imagem não suportada. Utilize imagens HTTP/HTTPS ou PNG/JPG/WEBP em base64."
});
