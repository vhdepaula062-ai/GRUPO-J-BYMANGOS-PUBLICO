/** Documents shown in lists must not expose the original document. */
export function maskCompanyDocument(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 14 ? `**.***.***/${digits.slice(8, 12)}-**` : "**.***.***/****-**";
}

export function safeSearchTerm(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s@._-]/gu, "").trim().slice(0, 100);
}
