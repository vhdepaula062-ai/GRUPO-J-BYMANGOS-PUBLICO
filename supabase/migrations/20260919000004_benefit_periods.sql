BEGIN;
ALTER TABLE entitlements ADD COLUMN valid_from timestamptz,ADD COLUMN valid_until timestamptz,ADD COLUMN is_current boolean NOT NULL DEFAULT false;
UPDATE entitlements e SET valid_from=c.cycle_start,valid_until=c.cycle_end FROM entitlement_cycles c WHERE c.id=e.cycle_id;
CREATE INDEX ON entitlements(customer_id,is_current);
-- Calendar periods are anchored at the first subscription, independent of billing renewal.
CREATE FUNCTION public.sync_customer_benefit_balances(p_customer uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE b record; anchor timestamptz; start_at timestamptz; end_at timestamptz; months integer; step integer; cycle uuid; consumed integer;
BEGIN
 PERFORM 1 FROM customers WHERE id=p_customer FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
 UPDATE entitlements SET is_current=false WHERE customer_id=p_customer AND is_current;
 SELECT min(least(created_at,current_period_start)) INTO anchor FROM subscriptions WHERE customer_id=p_customer AND status IN ('active','past_due','paused','canceled');
 IF anchor IS NULL OR anchor>now() THEN RETURN; END IF;
 FOR b IN SELECT DISTINCT d.id,d.periodicity,d.quantity_per_cycle FROM subscriptions s JOIN benefit_plan_rules r ON r.plan_id=s.plan_id JOIN benefit_definitions d ON d.id=r.benefit_definition_id WHERE s.customer_id=p_customer AND s.status='active' AND s.current_period_start<=now() AND s.current_period_end>now() AND r.is_active AND d.is_active LOOP
  months:=CASE b.periodicity WHEN 'quarterly' THEN 3 WHEN 'semiannual' THEN 6 WHEN 'annual' THEN 12 ELSE 1 END;
  step:=0;start_at:=anchor;end_at:=anchor+make_interval(months=>months);
  WHILE end_at<=now() LOOP step:=step+1;start_at:=end_at;end_at:=anchor+make_interval(months=>(step+1)*months); END LOOP;
  INSERT INTO entitlement_cycles(customer_id,cycle_start,cycle_end) VALUES(p_customer,start_at,end_at) ON CONFLICT(customer_id,cycle_start) DO UPDATE SET cycle_end=greatest(entitlement_cycles.cycle_end,EXCLUDED.cycle_end) RETURNING id INTO cycle;
  SELECT count(*) INTO consumed FROM benefit_redemptions WHERE customer_id=p_customer AND benefit_definition_id=b.id AND validated_at>=start_at AND validated_at<end_at;
  INSERT INTO entitlements(cycle_id,customer_id,benefit_definition_id,total_quantity,used_quantity,valid_from,valid_until,is_current) VALUES(cycle,p_customer,b.id,b.quantity_per_cycle,consumed,start_at,end_at,true)
  ON CONFLICT(cycle_id,benefit_definition_id) DO UPDATE SET used_quantity=greatest(entitlements.used_quantity,EXCLUDED.used_quantity),valid_from=EXCLUDED.valid_from,valid_until=EXCLUDED.valid_until,is_current=true;
 END LOOP;
END; $$;
REVOKE ALL ON FUNCTION public.sync_customer_benefit_balances(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_customer_benefit_balances(uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.provision_subscription_entitlements() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.customer_id IS NOT NULL THEN PERFORM sync_customer_benefit_balances(NEW.customer_id); END IF;
 RETURN NEW;
END; $$;
CREATE FUNCTION public.get_own_benefit_balances() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE customer uuid; result jsonb;
BEGIN
 SELECT id INTO customer FROM customers WHERE profile_id=auth.uid();
 IF customer IS NULL THEN RETURN '[]'::jsonb; END IF;
 PERFORM sync_customer_benefit_balances(customer);
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',e.id,'total_quantity',e.total_quantity,'used_quantity',e.used_quantity,'available_quantity',greatest(0,e.available_quantity),
 'benefit',jsonb_build_object('id',b.id,'name',b.name,'description',b.description,'slug',b.slug,'periodicity',b.periodicity,'grace_period_days',b.grace_period_days),
 'cycle',jsonb_build_object('cycle_start',e.valid_from,'cycle_end',e.valid_until))), '[]'::jsonb) INTO result FROM entitlements e JOIN benefit_definitions b ON b.id=e.benefit_definition_id WHERE e.customer_id=customer AND e.is_current;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.get_own_benefit_balances() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_own_benefit_balances() TO authenticated;
CREATE OR REPLACE FUNCTION public.create_benefit_voucher(p_vehicle_id uuid,p_benefit_definition_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  c public.customers;
  s public.subscriptions;
  b public.benefit_definitions;
  e public.entitlements;
  r public.benefit_redemptions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  SELECT * INTO c FROM public.customers WHERE profile_id=auth.uid() FOR UPDATE;
  IF c.id IS NULL THEN RAISE EXCEPTION 'CUSTOMER_NOT_FOUND'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.organizations WHERE id=c.assigned_workshop_id AND status='active') THEN RAISE EXCEPTION 'WORKSHOP_NOT_ACTIVE'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.vehicles WHERE id=p_vehicle_id AND customer_id=c.id AND is_active) THEN RAISE EXCEPTION 'VEHICLE_NOT_FOUND'; END IF;
  SELECT * INTO b FROM public.benefit_definitions WHERE id=p_benefit_definition_id AND is_active;
  IF b.id IS NULL THEN RAISE EXCEPTION 'BENEFIT_INACTIVE'; END IF;
  SELECT * INTO s FROM public.subscriptions WHERE customer_id=c.id AND status='active'
    AND current_period_start<=now() AND current_period_end>now() ORDER BY created_at LIMIT 1;
  IF s.id IS NULL THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE'; END IF;
  IF now()<s.created_at+make_interval(days=>b.grace_period_days) THEN RAISE EXCEPTION 'BENEFIT_GRACE_PERIOD'; END IF;
  PERFORM sync_customer_benefit_balances(c.id);
  SELECT * INTO e FROM entitlements WHERE customer_id=c.id AND benefit_definition_id=b.id AND is_current LIMIT 1;
  IF e.id IS NULL OR e.available_quantity<=0 THEN RAISE EXCEPTION 'BENEFIT_BALANCE_EXHAUSTED'; END IF;
  SELECT * INTO r FROM public.benefit_redemptions WHERE customer_id=c.id AND benefit_definition_id=b.id
    AND status='requested' AND voucher_expires_at>now() ORDER BY created_at DESC LIMIT 1;
  IF r.id IS NOT NULL THEN
    IF r.vehicle_id<>p_vehicle_id OR r.workshop_id<>c.assigned_workshop_id THEN RAISE EXCEPTION 'ACTIVE_VOUCHER_EXISTS'; END IF;
    RETURN jsonb_build_object('id',r.id,'voucherCode',r.voucher_token,'expiresAt',r.voucher_expires_at);
  END IF;
  INSERT INTO public.benefit_redemptions(customer_id,vehicle_id,workshop_id,benefit_definition_id,status,voucher_token,voucher_expires_at)
    VALUES(c.id,p_vehicle_id,c.assigned_workshop_id,b.id,'requested',upper(replace(gen_random_uuid()::text,'-','')),now()+interval '10 minutes') RETURNING * INTO r;
  RETURN jsonb_build_object('id',r.id,'voucherCode',r.voucher_token,'expiresAt',r.voucher_expires_at);
END;
$$;
CREATE OR REPLACE FUNCTION public.redeem_benefit_voucher(p_voucher_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  org uuid;
  r public.benefit_redemptions;
  e public.entitlements;
  target_customer uuid;
BEGIN
  SELECT m.organization_id INTO org FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
    WHERE m.user_id=auth.uid() AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant') ORDER BY m.created_at LIMIT 1;
  IF org IS NULL THEN RAISE EXCEPTION 'WORKSHOP_MEMBERSHIP_REQUIRED'; END IF;
  SELECT customer_id INTO target_customer FROM benefit_redemptions WHERE voucher_token=p_voucher_token AND workshop_id=org;
  IF target_customer IS NULL THEN RAISE EXCEPTION 'VOUCHER_NOT_FOUND'; END IF;
  PERFORM sync_customer_benefit_balances(target_customer);
  SELECT * INTO r FROM public.benefit_redemptions WHERE voucher_token=p_voucher_token FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'VOUCHER_NOT_FOUND'; END IF;
  IF r.workshop_id<>org OR NOT EXISTS(SELECT 1 FROM public.customers WHERE id=r.customer_id AND assigned_workshop_id=org) THEN RAISE EXCEPTION 'WORKSHOP_MISMATCH'; END IF;
  IF r.status<>'requested' THEN RAISE EXCEPTION 'VOUCHER_ALREADY_PROCESSED'; END IF;
  IF r.voucher_expires_at IS NULL OR r.voucher_expires_at<=now() THEN RAISE EXCEPTION 'VOUCHER_EXPIRED'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.vehicles WHERE id=r.vehicle_id AND customer_id=r.customer_id AND is_active) THEN RAISE EXCEPTION 'VEHICLE_NOT_FOUND'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.subscriptions s JOIN public.benefit_definitions b ON b.id=r.benefit_definition_id
    WHERE s.customer_id=r.customer_id AND s.status='active' AND s.current_period_start<=now() AND s.current_period_end>now()
      AND b.is_active AND now()>=s.created_at+make_interval(days=>b.grace_period_days)) THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE_OR_GRACE'; END IF;
  SELECT * INTO e FROM entitlements WHERE customer_id=r.customer_id AND benefit_definition_id=r.benefit_definition_id AND is_current LIMIT 1 FOR UPDATE;
  IF e.id IS NULL OR e.available_quantity<=0 THEN RAISE EXCEPTION 'BENEFIT_BALANCE_EXHAUSTED'; END IF;
  UPDATE public.entitlements SET used_quantity=used_quantity+1 WHERE id=e.id;
  UPDATE public.benefit_redemptions SET status='validated',validated_at=now(),validated_by_user_id=auth.uid() WHERE id=r.id;
  RETURN jsonb_build_object('redemptionId',r.id,'status','validated','validatedAt',now());
END;
$$;
COMMIT;
