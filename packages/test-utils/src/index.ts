import { Plan, Customer, Vehicle, WorkshopProfile } from "@grupo-j/types";

export const mockDriverPlan: Plan = {
  id: "00000000-0000-0000-0000-000000000001",
  code: "DRIVER_BASIC_MONTHLY",
  name: "Plano Motorista Grupo J",
  description: "Prevenção automotiva completa com alinhamento, balanceamento e check-up",
  audience: "customer",
  priceCents: 5000, // R$ 50,00 em centavos conforme regra comercial
  currency: "BRL",
  billingIntervalMonths: 1,
  isActive: true,
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z"
};

export const mockWorkshopPlan: Plan = {
  id: "00000000-0000-0000-0000-000000000002",
  code: "WORKSHOP_PARTNER_MONTHLY",
  name: "Plano Centro Automotivo Credenciado",
  description: "Acesso ao SaaS exclusivo Grupo J e fluxo de motoristas da rede",
  audience: "workshop",
  priceCents: 50000, // R$ 500,00 em centavos conforme regra comercial
  currency: "BRL",
  billingIntervalMonths: 1,
  isActive: true,
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z"
};

export const mockCustomer: Customer = {
  id: "11111111-1111-1111-1111-111111111111",
  profileId: "22222222-2222-2222-2222-222222222222",
  fullName: "Carlos Silva de Oliveira",
  email: "carlos.silva@exemplo.com.br",
  phone: "11988887777",
  cpfMasked: "***.456.789-**",
  assignedWorkshopId: "33333333-3333-3333-3333-333333333333",
  workshopAssignedAt: "2026-01-01T10:00:00.000Z",
  nextWorkshopChangeAllowedAt: "2026-01-31T10:00:00.000Z",
  createdAt: "2026-01-01T10:00:00.000Z",
  updatedAt: "2026-01-01T10:00:00.000Z"
};

export const mockVehicle: Vehicle = {
  id: "44444444-4444-4444-4444-444444444444",
  customerId: "11111111-1111-1111-1111-111111111111",
  plate: "BRA2E19",
  brand: "Volkswagen",
  model: "Gol 1.0 Flex",
  modelYear: 2022,
  manufactureYear: 2021,
  color: "Prata",
  renavamMasked: "*******8901",
  createdAt: "2026-01-01T10:00:00.000Z"
};

export const mockWorkshop: WorkshopProfile = {
  id: "33333333-3333-3333-3333-333333333333",
  organizationId: "55555555-5555-5555-5555-555555555555",
  addressStreet: "Avenida das Américas",
  addressNumber: "1500",
  addressNeighborhood: "Barra da Tijuca",
  addressCity: "Rio de Janeiro",
  addressState: "RJ",
  addressZipCode: "22640-100",
  latitude: -23.000371,
  longitude: -43.365894,
  ratingAverage: 4.9,
  ratingCount: 128,
  isOpenNow: true,
  operatingHours: {
    segunda_a_sexta: { open: "08:00", close: "18:00" },
    sabado: { open: "08:00", close: "13:00" }
  }
};
