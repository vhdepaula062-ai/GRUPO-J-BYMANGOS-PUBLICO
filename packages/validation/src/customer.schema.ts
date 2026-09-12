import { z } from "zod";
import { cpfSchema } from "./cpf.schema";
import { plateSchema } from "./plate.schema";

export const registerCustomerSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(120),
  email: z.string().email("E-mail com formato inválido"),
  phone: z.string().min(10, "Telefone deve conter no mínimo 10 dígitos").max(15),
  cpf: cpfSchema,
  initialVehicle: z.object({
    plate: plateSchema,
    brand: z.string().min(2, "Marca obrigatória"),
    model: z.string().min(2, "Modelo obrigatório"),
    modelYear: z.number().int().min(1980).max(new Date().getFullYear() + 2),
    color: z.string().min(2, "Cor obrigatória")
  }),
  selectedWorkshopId: z.string().uuid("Identificador de oficina inválido").optional()
});

export const updateCustomerProfileSchema = z.object({
  fullName: z.string().min(3).max(120).optional(),
  phone: z.string().min(10).max(15).optional()
});
