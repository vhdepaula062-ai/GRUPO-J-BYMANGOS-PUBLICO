-- GRUPO J — fundação para operação real, isolamento e fluxos atômicos

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(40) NOT NULL CHECK (document_type IN ('terms_of_use', 'privacy_policy', 'marketing')),
  document_version VARCHAR(40) NOT NULL,
  accepted BOOLEAN NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE (user_id, document_type, document_version)
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(40) NOT NULL,
  provider_event_id VARCHAR(160) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol VARCHAR(40) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  workshop_id UUID NOT NULL REFERENCES organizations(id),
  redemption_id UUID REFERENCES benefit_redemptions(id),
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'canceled')),
  odometer_km INTEGER CHECK (odometer_km >= 0),
  notes TEXT,
  opened_by UUID NOT NULL REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  protocol VARCHAR(40) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'identity_check', 'approved', 'processing', 'completed', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_profile ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_status ON subscriptions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_status ON subscriptions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_redemptions_workshop_status ON benefit_redemptions(workshop_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_customer_active ON workshop_assignments(customer_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_service_orders_workshop_created ON service_orders(workshop_id, created_at DESC);

INSERT INTO roles (code, name, description) VALUES
  ('customer', 'Motorista', 'Assinante do aplicativo'),
  ('workshop_owner', 'Proprietário de oficina', 'Responsável pela organização'),
  ('platform_owner', 'Proprietário da plataforma', 'Acesso administrativo total'),
  ('platform_admin', 'Administrador da plataforma', 'Administração operacional'),
  ('auditor', 'Auditor', 'Consulta de auditoria')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO plans (code, name, description, audience, price_cents, currency, billing_interval_months, is_active)
VALUES
  ('DRIVER_BASIC_50', 'Plano Motorista Grupo J', 'Benefícios preventivos para um motorista', 'customer', 5000, 'BRL', 1, true),
  ('WORKSHOP_PARTNER_500', 'Plano Oficina Parceira', 'Acesso ao SaaS da oficina', 'workshop', 50000, 'BRL', 1, true)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, price_cents = EXCLUDED.price_cents, is_active = EXCLUDED.is_active;

INSERT INTO benefit_definitions (name, slug, description, periodicity, quantity_per_cycle, grace_period_days, is_included_in_base_plan, is_active)
VALUES
  ('Alinhamento (Convergência)', 'alinhamento-convergencia', 'Ajuste da convergência das rodas conforme especificação do fabricante.', 'semiannual', 1, 0, true, true),
  ('Balanceamento de Rodas', 'balanceamento-rodas', 'Balanceamento preventivo das rodas do veículo elegível.', 'semiannual', 1, 0, true, true),
  ('Cristalização de Para-brisa', 'cristalizacao-parabrisa', 'Aplicação de proteção hidrofóbica no para-brisa.', 'annual', 1, 0, true, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = EXCLUDED.is_active;

INSERT INTO benefit_plan_rules (plan_id, benefit_definition_id, is_active)
SELECT p.id, b.id, true FROM plans p CROSS JOIN benefit_definitions b
WHERE p.code = 'DRIVER_BASIC_50' AND b.is_included_in_base_plan = true AND b.is_active = true
ON CONFLICT (plan_id, benefit_definition_id) DO UPDATE SET is_active = true;

CREATE OR REPLACE FUNCTION public.provision_subscription_entitlements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle_id UUID;
BEGIN
  IF NEW.customer_id IS NULL OR NEW.status <> 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND OLD.current_period_start = NEW.current_period_start AND OLD.current_period_end = NEW.current_period_end THEN RETURN NEW; END IF;
  INSERT INTO entitlement_cycles (customer_id, cycle_start, cycle_end)
  VALUES (NEW.customer_id, NEW.current_period_start, NEW.current_period_end)
  ON CONFLICT (customer_id, cycle_start) DO UPDATE SET cycle_end = EXCLUDED.cycle_end
  RETURNING id INTO v_cycle_id;
  INSERT INTO entitlements (cycle_id, customer_id, benefit_definition_id, total_quantity)
  SELECT v_cycle_id, NEW.customer_id, bpr.benefit_definition_id, bd.quantity_per_cycle
  FROM benefit_plan_rules bpr JOIN benefit_definitions bd ON bd.id = bpr.benefit_definition_id
  WHERE bpr.plan_id = NEW.plan_id AND bpr.is_active AND bd.is_active
  ON CONFLICT (cycle_id, benefit_definition_id) DO UPDATE SET total_quantity = EXCLUDED.total_quantity;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provision_subscription_entitlements ON subscriptions;
CREATE TRIGGER trg_provision_subscription_entitlements
AFTER INSERT OR UPDATE OF status, current_period_start, current_period_end ON subscriptions
FOR EACH ROW EXECUTE FUNCTION public.provision_subscription_entitlements();

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('platform_owner', 'platform_admin', 'auditor')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid() AND is_active = true
  ORDER BY created_at LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_role_id UUID;
BEGIN
  INSERT INTO profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(COALESCE(NEW.email, 'usuario'), '@', 1)),
    COALESCE(NEW.email, NEW.id::text || '@pending.local'),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer') = 'customer' THEN
    INSERT INTO customers (profile_id) VALUES (NEW.id) ON CONFLICT (profile_id) DO NOTHING;
    SELECT id INTO customer_role_id FROM roles WHERE code = 'customer';
    IF customer_role_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id) VALUES (NEW.id, customer_role_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.request_workshop_change(p_workshop_id UUID)
RETURNS workshop_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer customers;
  v_assignment workshop_assignments;
BEGIN
  SELECT * INTO v_customer FROM customers WHERE profile_id = auth.uid() FOR UPDATE;
  IF v_customer.id IS NULL THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
  IF v_customer.next_workshop_change_allowed_at IS NOT NULL AND now() < v_customer.next_workshop_change_allowed_at THEN
    RAISE EXCEPTION 'WORKSHOP_CHANGE_COOLDOWN:%', v_customer.next_workshop_change_allowed_at;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_workshop_id AND status = 'active') THEN
    RAISE EXCEPTION 'WORKSHOP_NOT_ACTIVE';
  END IF;

  UPDATE workshop_assignments SET is_active = false
  WHERE customer_id = v_customer.id AND is_active = true;

  INSERT INTO workshop_assignments (customer_id, workshop_id, assigned_at, next_change_allowed_at, is_active)
  VALUES (v_customer.id, p_workshop_id, now(), now() + interval '30 days', true)
  RETURNING * INTO v_assignment;

  INSERT INTO workshop_assignment_history (customer_id, previous_workshop_id, new_workshop_id, reason)
  VALUES (v_customer.id, v_customer.assigned_workshop_id, p_workshop_id, 'customer_request');
  RETURN v_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_benefit_voucher(p_voucher_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID := get_user_organization_id();
  v_redemption benefit_redemptions;
  v_entitlement entitlements;
BEGIN
  IF v_org IS NULL THEN RAISE EXCEPTION 'WORKSHOP_MEMBERSHIP_REQUIRED'; END IF;
  SELECT * INTO v_redemption FROM benefit_redemptions
  WHERE voucher_token = p_voucher_token FOR UPDATE;
  IF v_redemption.id IS NULL THEN RAISE EXCEPTION 'VOUCHER_NOT_FOUND'; END IF;
  IF v_redemption.workshop_id <> v_org THEN RAISE EXCEPTION 'WORKSHOP_MISMATCH'; END IF;
  IF v_redemption.status <> 'requested' THEN RAISE EXCEPTION 'VOUCHER_ALREADY_PROCESSED'; END IF;
  IF v_redemption.voucher_expires_at < now() THEN RAISE EXCEPTION 'VOUCHER_EXPIRED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE customer_id = v_redemption.customer_id AND status = 'active' AND current_period_end > now()) THEN
    RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE';
  END IF;

  SELECT e.* INTO v_entitlement FROM entitlements e
  JOIN entitlement_cycles c ON c.id = e.cycle_id
  WHERE e.customer_id = v_redemption.customer_id
    AND e.benefit_definition_id = v_redemption.benefit_definition_id
    AND now() BETWEEN c.cycle_start AND c.cycle_end
  ORDER BY c.cycle_start DESC LIMIT 1 FOR UPDATE OF e;
  IF v_entitlement.id IS NULL OR v_entitlement.available_quantity <= 0 THEN RAISE EXCEPTION 'BENEFIT_BALANCE_EXHAUSTED'; END IF;

  UPDATE entitlements SET used_quantity = used_quantity + 1 WHERE id = v_entitlement.id;
  UPDATE benefit_redemptions SET status = 'validated', validated_at = now(), validated_by_user_id = auth.uid()
  WHERE id = v_redemption.id;
  RETURN jsonb_build_object('redemptionId', v_redemption.id, 'status', 'validated', 'validatedAt', now());
END;
$$;

CREATE OR REPLACE FUNCTION public.create_benefit_voucher(p_vehicle_id UUID, p_benefit_definition_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer customers;
  v_entitlement entitlements;
  v_token TEXT := upper(encode(gen_random_bytes(12), 'hex'));
  v_redemption_id UUID;
  v_expires_at TIMESTAMPTZ := now() + interval '10 minutes';
BEGIN
  SELECT * INTO v_customer FROM customers WHERE profile_id = auth.uid();
  IF v_customer.id IS NULL THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
  IF v_customer.assigned_workshop_id IS NULL THEN RAISE EXCEPTION 'WORKSHOP_REQUIRED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id AND customer_id = v_customer.id AND is_active) THEN RAISE EXCEPTION 'VEHICLE_NOT_FOUND'; END IF;
  IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE customer_id = v_customer.id AND status = 'active' AND current_period_end > now()) THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE'; END IF;
  SELECT e.* INTO v_entitlement FROM entitlements e JOIN entitlement_cycles c ON c.id = e.cycle_id
  WHERE e.customer_id = v_customer.id AND e.benefit_definition_id = p_benefit_definition_id
    AND now() BETWEEN c.cycle_start AND c.cycle_end ORDER BY c.cycle_start DESC LIMIT 1;
  IF v_entitlement.id IS NULL OR v_entitlement.available_quantity <= 0 THEN RAISE EXCEPTION 'BENEFIT_BALANCE_EXHAUSTED'; END IF;
  IF EXISTS (SELECT 1 FROM benefit_redemptions WHERE customer_id = v_customer.id AND benefit_definition_id = p_benefit_definition_id AND status = 'requested' AND voucher_expires_at > now()) THEN RAISE EXCEPTION 'ACTIVE_VOUCHER_EXISTS'; END IF;
  INSERT INTO benefit_redemptions (customer_id, vehicle_id, workshop_id, benefit_definition_id, status, voucher_token, voucher_expires_at)
  VALUES (v_customer.id, p_vehicle_id, v_customer.assigned_workshop_id, p_benefit_definition_id, 'requested', v_token, v_expires_at)
  RETURNING id INTO v_redemption_id;
  RETURN jsonb_build_object('id', v_redemption_id, 'voucherCode', v_token, 'expiresAt', v_expires_at);
END;
$$;

-- Nenhuma tabela de negócio fica exposta sem RLS. O service role continua reservado ao backend.
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plan_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlement_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_erasure_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated reads roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users read own roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_platform_admin());
CREATE POLICY "members read workshop units" ON organization_units FOR SELECT TO authenticated USING (organization_id = get_user_organization_id() OR is_platform_admin());
CREATE POLICY "active workshop profiles readable" ON workshop_profiles FOR SELECT TO authenticated USING (organization_id = get_user_organization_id() OR is_platform_admin() OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.status = 'active'));
CREATE POLICY "members manage workshop services" ON workshop_services FOR ALL TO authenticated USING (organization_id = get_user_organization_id() OR is_platform_admin()) WITH CHECK (organization_id = get_user_organization_id() OR is_platform_admin());
CREATE POLICY "customers read entitlements cycles" ON entitlement_cycles FOR SELECT TO authenticated USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin());
CREATE POLICY "customers read assignment history" ON workshop_assignment_history FOR SELECT TO authenticated USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin());
CREATE POLICY "users manage own consents" ON consent_records FOR ALL TO authenticated USING (user_id = auth.uid() OR is_platform_admin()) WITH CHECK (user_id = auth.uid() OR is_platform_admin());
CREATE POLICY "customers read own service orders" ON service_orders FOR SELECT TO authenticated USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR workshop_id = get_user_organization_id() OR is_platform_admin());
CREATE POLICY "workshops create service orders" ON service_orders FOR INSERT TO authenticated WITH CHECK (
  workshop_id = get_user_organization_id() AND opened_by = auth.uid()
  AND EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.assigned_workshop_id = workshop_id)
  AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id AND v.customer_id = customer_id AND v.is_active)
);
CREATE POLICY "workshops update service orders" ON service_orders FOR UPDATE TO authenticated USING (workshop_id = get_user_organization_id() OR is_platform_admin()) WITH CHECK (workshop_id = get_user_organization_id() OR is_platform_admin());
CREATE POLICY "users create erasure request" ON account_erasure_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users read erasure request" ON account_erasure_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_platform_admin());

-- Reforça WITH CHECK nas políticas mutáveis existentes.
DROP POLICY IF EXISTS "Motoristas gerenciam seus veículos" ON vehicles;
CREATE POLICY "Motoristas gerenciam seus veículos" ON vehicles FOR ALL TO authenticated
USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin())
WITH CHECK (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin());

DROP POLICY IF EXISTS "Oficinas gerenciam resgates exclusivos da sua unidade" ON benefit_redemptions;
CREATE POLICY "Oficinas gerenciam resgates exclusivos da sua unidade" ON benefit_redemptions FOR ALL TO authenticated
USING (workshop_id = get_user_organization_id() OR is_platform_admin())
WITH CHECK (workshop_id = get_user_organization_id() OR is_platform_admin());

REVOKE ALL ON FUNCTION public.request_workshop_change(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_workshop_change(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.redeem_benefit_voucher(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_benefit_voucher(TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.create_benefit_voucher(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_benefit_voucher(UUID, UUID) TO authenticated;
