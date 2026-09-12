export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface ProfileRow extends DatabaseRow {
  full_name: string;
  email: string;
  phone: string | null;
  cpf_masked: string | null;
  cpf_encrypted: string | null;
  cpf_blind_index: string | null;
  mfa_enabled: boolean;
}

export interface OrganizationRow extends DatabaseRow {
  legal_name: string;
  trade_name: string;
  cnpj_masked: string;
  status: string;
  phone: string;
  email: string;
}

export interface SubscriptionRow extends DatabaseRow {
  plan_id: string;
  customer_id: string | null;
  organization_id: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  gateway_subscription_id: string | null;
}
