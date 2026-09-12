-- ==============================================================================
-- GRUPO J ECOSYSTEM — MIGRATION INICIAL: ESQUEMA COMPLETO DE DADOS
-- Versão: 20260912000001
-- ==============================================================================

-- Extensões Essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. IDENTIDADE E ACESSO
-- ==============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    cpf_masked VARCHAR(14),
    cpf_encrypted TEXT,
    cpf_blind_index VARCHAR(64) UNIQUE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES profiles(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS sessions_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    is_mfa_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

-- ==============================================================================
-- 2. ORGANIZAÇÕES (OFICINAS PARCEIRAS E MATRIZ)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(180) NOT NULL,
    trade_name VARCHAR(180) NOT NULL,
    cnpj_masked VARCHAR(18) NOT NULL,
    cnpj_blind_index VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'suspended', 'inactive')),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    is_headquarters BOOLEAN NOT NULL DEFAULT false,
    address_street VARCHAR(200) NOT NULL,
    address_number VARCHAR(30) NOT NULL,
    address_neighborhood VARCHAR(100) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_state CHAR(2) NOT NULL,
    address_zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'manager', 'attendant', 'finance')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS workshop_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    description TEXT,
    rating_average DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_open_now BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'verified', 'rejected')),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_name VARCHAR(120) NOT NULL,
    description TEXT,
    price_cents INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. CLIENTES E VEÍCULOS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    assigned_workshop_id UUID REFERENCES organizations(id),
    workshop_assigned_at TIMESTAMPTZ,
    next_workshop_change_allowed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    contact_type VARCHAR(30) NOT NULL,
    value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    street VARCHAR(200) NOT NULL,
    number VARCHAR(30) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate VARCHAR(10) NOT NULL,
    plate_clean VARCHAR(10) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    model_year INTEGER NOT NULL,
    manufacture_year INTEGER NOT NULL,
    color VARCHAR(40) NOT NULL,
    renavam_masked VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, plate_clean)
);

CREATE TABLE IF NOT EXISTS vehicle_ownership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    previous_customer_id UUID REFERENCES customers(id),
    new_customer_id UUID NOT NULL REFERENCES customers(id),
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. PLANOS E COBRANÇA (VALORES EM CENTAVOS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    audience VARCHAR(30) NOT NULL CHECK (audience IN ('customer', 'workshop')),
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    billing_interval_months INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    UNIQUE (plan_id, version)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id),
    customer_id UUID REFERENCES customers(id),
    organization_id UUID REFERENCES organizations(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'past_due', 'paused', 'canceled', 'failed')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    gateway_subscription_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_subscription_subject CHECK (
        (customer_id IS NOT NULL AND organization_id IS NULL) OR
        (customer_id IS NULL AND organization_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS subscription_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    organization_id UUID REFERENCES organizations(id),
    gateway_customer_id VARCHAR(100) NOT NULL UNIQUE,
    gateway_provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
    gateway_payment_method_id VARCHAR(100) NOT NULL UNIQUE,
    card_brand VARCHAR(40),
    card_last_four CHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    gateway_payment_id VARCHAR(100) UNIQUE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'refunded', 'charged_back')),
    payment_method_type VARCHAR(40) NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    payment_id UUID REFERENCES payments(id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount_cents INTEGER NOT NULL,
    due_date DATE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    discount_type VARCHAR(30) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_cents', 'trial_cycles')),
    value INTEGER NOT NULL CHECK (value > 0),
    reason TEXT NOT NULL,
    granted_by UUID NOT NULL REFERENCES profiles(id),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    is_reverted BOOLEAN NOT NULL DEFAULT false,
    reverted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    cycles_waived INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    granted_by UUID NOT NULL REFERENCES profiles(id),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    is_reverted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. BENEFÍCIOS E OPERAÇÃO AUTOMOTIVA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS benefit_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    periodicity VARCHAR(30) NOT NULL CHECK (periodicity IN ('monthly', 'quarterly', 'semiannual', 'annual')),
    quantity_per_cycle INTEGER NOT NULL DEFAULT 1 CHECK (quantity_per_cycle > 0),
    grace_period_days INTEGER NOT NULL DEFAULT 0,
    is_included_in_base_plan BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benefit_plan_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    benefit_definition_id UUID NOT NULL REFERENCES benefit_definitions(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (plan_id, benefit_definition_id)
);

CREATE TABLE IF NOT EXISTS entitlement_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, cycle_start)
);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES entitlement_cycles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    benefit_definition_id UUID NOT NULL REFERENCES benefit_definitions(id) ON DELETE CASCADE,
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
    used_quantity INTEGER NOT NULL DEFAULT 0 CHECK (used_quantity >= 0),
    available_quantity INTEGER GENERATED ALWAYS AS (total_quantity - used_quantity) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cycle_id, benefit_definition_id)
);

CREATE TABLE IF NOT EXISTS benefit_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    workshop_id UUID NOT NULL REFERENCES organizations(id),
    benefit_definition_id UUID NOT NULL REFERENCES benefit_definitions(id),
    status VARCHAR(30) NOT NULL DEFAULT 'validated' CHECK (status IN ('requested', 'validated', 'in_progress', 'completed', 'canceled', 'rejected')),
    voucher_token VARCHAR(64) NOT NULL UNIQUE,
    voucher_expires_at TIMESTAMPTZ NOT NULL,
    validated_at TIMESTAMPTZ,
    validated_by_user_id UUID REFERENCES profiles(id),
    evidence_photo_urls TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. TRAVA INEGOCIÁVEL DE 30 DIAS PARA TROCA DE OFICINA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS workshop_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES organizations(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_change_allowed_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_assignment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    previous_workshop_id UUID REFERENCES organizations(id),
    new_workshop_id UUID NOT NULL REFERENCES organizations(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- Função e Trigger para impor a regra de 30 dias no PostgreSQL
CREATE OR REPLACE FUNCTION check_workshop_assignment_cooldown()
RETURNS TRIGGER AS $$
DECLARE
    last_allowed_at TIMESTAMPTZ;
BEGIN
    SELECT next_workshop_change_allowed_at INTO last_allowed_at
    FROM customers
    WHERE id = NEW.customer_id;

    IF last_allowed_at IS NOT NULL AND CURRENT_TIMESTAMP < last_allowed_at THEN
        RAISE EXCEPTION 'A troca de oficina parceira só é permitida após 30 dias. Próxima data permitida: %', last_allowed_at;
    END IF;

    -- Atualiza a data de próxima troca permitida para exatamente +30 dias
    NEW.next_change_allowed_at := NEW.assigned_at + INTERVAL '30 days';

    UPDATE customers
    SET assigned_workshop_id = NEW.workshop_id,
        workshop_assigned_at = NEW.assigned_at,
        next_workshop_change_allowed_at = NEW.next_change_allowed_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_workshop_assignment ON workshop_assignments;
CREATE TRIGGER trg_check_workshop_assignment
    BEFORE INSERT ON workshop_assignments
    FOR EACH ROW
    EXECUTE FUNCTION check_workshop_assignment_cooldown();

-- ==============================================================================
-- 7. PROMOÇÕES, AUDITORIA, CONFIGURAÇÃO REMOTA E OUTBOX
-- ==============================================================================

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    discount_percentage INTEGER CHECK (discount_percentage BETWEEN 1 AND 100),
    price_cents INTEGER CHECK (price_cents >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'paused', 'rejected', 'expired')),
    moderated_by_user_id UUID REFERENCES profiles(id),
    moderation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS remote_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES profiles(id),
    actor_ip INET,
    actor_user_agent TEXT,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_access_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_user_id UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    authorization_code VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    terminated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    endpoint VARCHAR(160) NOT NULL,
    response_status INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);
