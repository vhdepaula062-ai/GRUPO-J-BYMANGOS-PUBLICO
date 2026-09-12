import { z } from "zod";

export function isValidCPF(cpfRaw: string): boolean {
  const cpf = cpfRaw.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}

export const cpfSchema = z
  .string()
  .min(11, "CPF deve conter no mínimo 11 dígitos")
  .max(14, "CPF não pode exceder 14 caracteres com máscara")
  .refine(isValidCPF, { message: "CPF inválido de acordo com o algoritmo oficial da Receita Federal" });
