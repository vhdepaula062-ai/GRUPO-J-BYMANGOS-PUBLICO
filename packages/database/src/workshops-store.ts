import fs from "fs";
import path from "path";

export interface EcosystemWorkshop {
  id: string;
  trade_name: string;
  legal_name: string;
  cnpj_masked: string;
  email: string;
  phone: string;
  status: "pending_approval" | "active" | "suspended" | "inactive";
  created_at: string;
  updated_at?: string;
  responsible_name?: string;
  city?: string;
  state?: string;
}

export const INITIAL_ECOSYSTEM_WORKSHOPS: EcosystemWorkshop[] = [
  {
    id: "ws-pending-001",
    trade_name: "Auto Center Estrela do Sul",
    legal_name: "Estrela do Sul Reparações Mecânicas Ltda",
    cnpj_masked: "28.492.103/0001-44",
    email: "contato@estreladosul.com.br",
    phone: "(11) 98451-2290",
    status: "pending_approval",
    created_at: "2026-09-12T10:00:00.000Z",
    responsible_name: "Marcos Estrela",
    city: "São Paulo",
    state: "SP"
  },
  {
    id: "ws-active-001",
    trade_name: "Auto Mecânica Bandeirantes",
    legal_name: "Bandeirantes Motores e Peças Ltda",
    cnpj_masked: "14.238.990/0001-52",
    email: "financeiro@mecanicabandeirantes.com.br",
    phone: "(11) 3456-7890",
    status: "active",
    created_at: "2026-09-10T08:30:00.000Z",
    responsible_name: "Roberto Bandeira",
    city: "Campinas",
    state: "SP"
  }
];

// Fallback em memória para quando o FS não estiver disponível
let inMemoryWorkshops: EcosystemWorkshop[] = [...INITIAL_ECOSYSTEM_WORKSHOPS];

function findMonorepoRoot(startDir: string): string {
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

function getStoreFilePath(): string {
  const root = findMonorepoRoot(process.cwd());
  const dataDir = path.join(root, ".ecosystem-data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignora erro se não puder criar
    }
  }
  return path.join(dataDir, "workshops.json");
}

export function readEcosystemWorkshops(): EcosystemWorkshop[] {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) {
      writeEcosystemWorkshops(INITIAL_ECOSYSTEM_WORKSHOPS);
      return INITIAL_ECOSYSTEM_WORKSHOPS;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as EcosystemWorkshop[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryWorkshops = parsed;
      return parsed;
    }
    return inMemoryWorkshops;
  } catch (error) {
    console.warn("[workshops-store] Usando fallback em memória:", error);
    return inMemoryWorkshops;
  }
}

export function writeEcosystemWorkshops(workshops: EcosystemWorkshop[]): void {
  inMemoryWorkshops = workshops;
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(workshops, null, 2), "utf-8");
  } catch (error) {
    console.warn("[workshops-store] Falha ao gravar arquivo, mantido em memória:", error);
  }
}

export function registerPendingWorkshopProposal(data: {
  trade_name: string;
  legal_name?: string;
  cnpj_masked: string;
  email: string;
  phone: string;
  responsible_name?: string;
  city?: string;
  state?: string;
}): EcosystemWorkshop {
  const current = readEcosystemWorkshops();

  // Verifica se já existe por e-mail ou CNPJ
  const cleanCnpj = data.cnpj_masked.replace(/\D/g, "");
  const existing = current.find(
    (w) =>
      w.email.toLowerCase() === data.email.trim().toLowerCase() ||
      w.cnpj_masked.replace(/\D/g, "") === cleanCnpj
  );

  if (existing) {
    return existing;
  }

  const newWorkshop: EcosystemWorkshop = {
    id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    trade_name: data.trade_name.trim(),
    legal_name: data.legal_name?.trim() || data.trade_name.trim(),
    cnpj_masked: data.cnpj_masked.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    status: "pending_approval", // Sempre nasce aguardando aprovação
    created_at: new Date().toISOString(),
    responsible_name: data.responsible_name?.trim(),
    city: data.city?.trim() || "São Paulo",
    state: data.state?.trim().toUpperCase() || "SP"
  };

  const updated = [newWorkshop, ...current];
  writeEcosystemWorkshops(updated);
  return newWorkshop;
}

export function updateEcosystemWorkshopStatus(
  workshopId: string,
  newStatus: "pending_approval" | "active" | "suspended" | "inactive"
): EcosystemWorkshop | null {
  const current = readEcosystemWorkshops();
  const index = current.findIndex((w) => w.id === workshopId);

  if (index === -1) {
    return null;
  }

  const existing = current[index];
  if (!existing) {
    return null;
  }

  const updated: EcosystemWorkshop = {
    ...existing,
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  current[index] = updated;
  writeEcosystemWorkshops(current);
  return updated;
}

export function getWorkshopByEmail(email: string): EcosystemWorkshop | null {
  const current = readEcosystemWorkshops();
  const cleanEmail = email.trim().toLowerCase();
  const found = current.find((w) => w.email.toLowerCase() === cleanEmail);
  return found ?? null;
}
