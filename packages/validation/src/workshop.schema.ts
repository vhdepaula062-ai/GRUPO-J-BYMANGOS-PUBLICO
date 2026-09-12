import { z } from "zod";

export const registerWorkshopSchema = z.object({
  legalName: z.string().min(3, "Razão social obrigatória").max(160),
  tradeName: z.string().min(2, "Nome fantasia obrigatório").max(160),
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido").max(15),
  addressStreet: z.string().min(3, "Logradouro obrigatório"),
  addressNumber: z.string().min(1, "Número obrigatório"),
  addressNeighborhood: z.string().min(2, "Bairro obrigatório"),
  addressCity: z.string().min(2, "Cidade obrigatória"),
  addressState: z.string().length(2, "UF deve conter exatamente 2 letras").toUpperCase(),
  addressZipCode: z.string().min(8, "CEP inválido").max(9)
});

export const assignWorkshopSchema = z.object({
  workshopId: z.string().uuid("ID de oficina parceira inválido")
});
