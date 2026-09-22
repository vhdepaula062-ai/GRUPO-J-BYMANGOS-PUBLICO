BEGIN;
-- Normalize legacy administrator metadata into revocable database roles.
INSERT INTO user_roles(user_id,role_id)
SELECT u.id,r.id FROM auth.users u JOIN roles r ON r.code=CASE
 WHEN to_jsonb(u)->'raw_app_meta_data'->>'role' IN ('platform_owner','super_admin') THEN 'platform_owner' ELSE 'platform_admin' END
WHERE to_jsonb(u)->'raw_app_meta_data'->>'role' IN ('admin','platform_admin','platform_owner','super_admin')
ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.is_platform_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=auth.uid() AND r.code IN ('platform_owner','platform_admin'));
$$;
CREATE FUNCTION public.manage_workshop_member(p_org uuid,p_email text,p_role text,p_active boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE actor_role text; target uuid; existing_role text;
BEGIN
 PERFORM 1 FROM organizations WHERE id=p_org AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'WORKSHOP_NOT_ACTIVE'; END IF;
 SELECT role INTO actor_role FROM organization_members WHERE organization_id=p_org AND user_id=auth.uid() AND is_active;
 IF actor_role IS NULL OR actor_role NOT IN ('owner','manager') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT id INTO target FROM profiles WHERE lower(email)=lower(trim(p_email));
 IF target IS NULL OR target=auth.uid() THEN RAISE EXCEPTION 'INVALID_MEMBER'; END IF;
 IF p_role NOT IN ('owner','manager','attendant','finance') OR p_active IS NULL THEN RAISE EXCEPTION 'INVALID_ROLE'; END IF;
 SELECT role INTO existing_role FROM organization_members WHERE organization_id=p_org AND user_id=target;
 IF actor_role='manager' AND (p_role IN ('owner','manager') OR existing_role IN ('owner','manager')) THEN RAISE EXCEPTION 'OWNER_REQUIRED'; END IF;
 IF EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=target AND r.code IN ('platform_admin','platform_owner')) THEN RAISE EXCEPTION 'INVALID_MEMBER'; END IF;
 IF EXISTS(SELECT 1 FROM organization_members WHERE user_id=target AND organization_id<>p_org AND is_active) THEN RAISE EXCEPTION 'MEMBER_OTHER_WORKSHOP'; END IF;
 IF existing_role='owner' AND (NOT p_active OR p_role<>'owner') AND (SELECT count(*) FROM organization_members WHERE organization_id=p_org AND role='owner' AND is_active AND user_id<>target)=0 THEN RAISE EXCEPTION 'LAST_OWNER'; END IF;
 INSERT INTO organization_members(organization_id,user_id,role,is_active) VALUES(p_org,target,p_role,p_active)
 ON CONFLICT(organization_id,user_id) DO UPDATE SET role=EXCLUDED.role,is_active=EXCLUDED.is_active;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'organization_members',target,'membership_update','Gestão de colaborador pela oficina');
END; $$;

CREATE FUNCTION public.manage_platform_admin(p_email text,p_enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE target uuid; v_role_id uuid;
BEGIN
 -- Grant/revoke administrators requires an actual platform owner, never an ordinary admin.
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=auth.uid() AND r.code='platform_owner') THEN RAISE EXCEPTION 'OWNER_REQUIRED'; END IF;
 SELECT id INTO target FROM profiles WHERE lower(email)=lower(trim(p_email));
 IF target IS NULL OR target=auth.uid() OR p_enabled IS NULL THEN RAISE EXCEPTION 'INVALID_MEMBER'; END IF;
 PERFORM 1 FROM profiles WHERE id=target FOR UPDATE;
 IF EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=target AND r.code='platform_owner') THEN RAISE EXCEPTION 'OWNER_PROTECTED'; END IF;
 SELECT id INTO v_role_id FROM roles WHERE code='platform_admin';
 IF p_enabled THEN
  INSERT INTO user_roles(user_id,role_id) VALUES(target,v_role_id) ON CONFLICT DO NOTHING;
 ELSE
  DELETE FROM user_roles ur WHERE ur.user_id=target AND ur.role_id=v_role_id;
 END IF;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'user_roles',target,CASE WHEN p_enabled THEN 'admin_granted' ELSE 'admin_revoked' END,'Gestão de acesso pelo proprietário');
END; $$;

CREATE FUNCTION public.create_catalog_plan(p_name text,p_audience text,p_price integer,p_months integer,p_benefits uuid[]) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE plan_id uuid;
BEGIN
 IF NOT is_platform_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF length(trim(p_name)) NOT BETWEEN 3 AND 100 OR p_audience NOT IN ('customer','workshop') OR p_price NOT BETWEEN 1 AND 100000000 OR p_months NOT BETWEEN 1 AND 12 THEN RAISE EXCEPTION 'INVALID_PLAN'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(p_benefits) b WHERE NOT EXISTS(SELECT 1 FROM benefit_definitions d WHERE d.id=b AND d.is_active)) THEN RAISE EXCEPTION 'INVALID_BENEFIT'; END IF;
 INSERT INTO plans(code,name,audience,price_cents,billing_interval_months) VALUES('plan-'||gen_random_uuid(),trim(p_name),p_audience,p_price,p_months) RETURNING id INTO plan_id;
 INSERT INTO benefit_plan_rules(plan_id,benefit_definition_id) SELECT plan_id,b FROM unnest(p_benefits) b ON CONFLICT DO NOTHING;
 INSERT INTO plan_versions(plan_id,version,price_cents,created_by) VALUES(plan_id,1,p_price,auth.uid());
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'plans',plan_id,'create','Nova oferta de catálogo; contratos existentes preservados');
 RETURN plan_id;
END; $$;

CREATE FUNCTION public.grant_trial_subscription(p_plan uuid,p_customer uuid,p_org uuid,p_days integer,p_reason text,p_key uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s subscriptions; plan plans;
BEGIN
 IF NOT is_platform_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF p_days IS NULL OR p_days NOT BETWEEN 1 AND 365 OR COALESCE(length(trim(p_reason)),0) NOT BETWEEN 10 AND 1000 OR p_key IS NULL OR ((p_customer IS NULL)=(p_org IS NULL)) THEN RAISE EXCEPTION 'INVALID_TRIAL'; END IF;
 SELECT * INTO plan FROM plans WHERE id=p_plan AND is_active;
 IF plan.id IS NULL OR (p_customer IS NOT NULL AND plan.audience<>'customer') OR (p_org IS NOT NULL AND plan.audience<>'workshop') THEN RAISE EXCEPTION 'INVALID_PLAN'; END IF;
 IF p_customer IS NOT NULL THEN PERFORM 1 FROM customers WHERE id=p_customer FOR UPDATE; ELSE PERFORM 1 FROM organizations WHERE id=p_org FOR UPDATE; END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'SUBJECT_NOT_FOUND'; END IF;
 SELECT * INTO s FROM subscriptions WHERE id=p_key;
 IF s.id IS NOT NULL THEN
  IF s.customer_id IS DISTINCT FROM p_customer OR s.organization_id IS DISTINCT FROM p_org OR s.plan_id<>p_plan THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
  RETURN s.id;
 END IF;
 IF EXISTS(SELECT 1 FROM subscriptions WHERE (customer_id=p_customer OR organization_id=p_org) AND status IN ('active','past_due','paused') AND current_period_end>now()) THEN RAISE EXCEPTION 'ACTIVE_CONTRACT_EXISTS'; END IF;
 INSERT INTO subscriptions(id,plan_id,customer_id,organization_id,status,current_period_start,current_period_end,trial_end,cancel_at_period_end)
 VALUES(p_key,p_plan,p_customer,p_org,'active',now(),now()+make_interval(days=>p_days),now()+make_interval(days=>p_days),true) RETURNING * INTO s;
 INSERT INTO subscription_status_history(subscription_id,new_status,reason) VALUES(s.id,'active','Período gratuito: '||trim(p_reason));
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'subscriptions',s.id,'trial_granted',trim(p_reason));
 RETURN s.id;
END; $$;
DO $$ DECLARE f regprocedure; BEGIN
 FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('manage_workshop_member','manage_platform_admin','create_catalog_plan','grant_trial_subscription') LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon',f);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f);
 END LOOP;
END $$;
COMMIT;
