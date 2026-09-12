import { z } from "zod";

// Padrão Mercosul (ex: ABC1D23) ou Tradicional (ex: ABC-1234 ou ABC1234)
const BRAZILIAN_PLATE_REGEX = /^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/i;

export const plateSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(BRAZILIAN_PLATE_REGEX, {
    message: "Placa do veículo inválida. Deve seguir o formato Mercosul (ABC1D23) ou tradicional (ABC1234)."
  });
