BEGIN;
-- Validate at the database boundary too: direct RPC must not bypass route checks.
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
  SELECT x.* INTO e FROM public.entitlements x JOIN public.entitlement_cycles y ON y.id=x.cycle_id
    WHERE x.customer_id=c.id AND x.benefit_definition_id=b.id AND y.cycle_start<=now() AND y.cycle_end>now()
    ORDER BY y.cycle_start DESC LIMIT 1;
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
BEGIN
  SELECT m.organization_id INTO org FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
    WHERE m.user_id=auth.uid() AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant') ORDER BY m.created_at LIMIT 1;
  IF org IS NULL THEN RAISE EXCEPTION 'WORKSHOP_MEMBERSHIP_REQUIRED'; END IF;
  SELECT * INTO r FROM public.benefit_redemptions WHERE voucher_token=p_voucher_token FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'VOUCHER_NOT_FOUND'; END IF;
  IF r.workshop_id<>org OR NOT EXISTS(SELECT 1 FROM public.customers WHERE id=r.customer_id AND assigned_workshop_id=org) THEN RAISE EXCEPTION 'WORKSHOP_MISMATCH'; END IF;
  IF r.status<>'requested' THEN RAISE EXCEPTION 'VOUCHER_ALREADY_PROCESSED'; END IF;
  IF r.voucher_expires_at IS NULL OR r.voucher_expires_at<=now() THEN RAISE EXCEPTION 'VOUCHER_EXPIRED'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.vehicles WHERE id=r.vehicle_id AND customer_id=r.customer_id AND is_active) THEN RAISE EXCEPTION 'VEHICLE_NOT_FOUND'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.subscriptions s JOIN public.benefit_definitions b ON b.id=r.benefit_definition_id
    WHERE s.customer_id=r.customer_id AND s.status='active' AND s.current_period_start<=now() AND s.current_period_end>now()
      AND b.is_active AND now()>=s.created_at+make_interval(days=>b.grace_period_days)) THEN RAISE EXCEPTION 'SUBSCRIPTION_INACTIVE_OR_GRACE'; END IF;
  SELECT x.* INTO e FROM public.entitlements x JOIN public.entitlement_cycles y ON y.id=x.cycle_id
    WHERE x.customer_id=r.customer_id AND x.benefit_definition_id=r.benefit_definition_id AND y.cycle_start<=now() AND y.cycle_end>now()
    ORDER BY y.cycle_start DESC LIMIT 1 FOR UPDATE OF x;
  IF e.id IS NULL OR e.available_quantity<=0 THEN RAISE EXCEPTION 'BENEFIT_BALANCE_EXHAUSTED'; END IF;
  UPDATE public.entitlements SET used_quantity=used_quantity+1 WHERE id=e.id;
  UPDATE public.benefit_redemptions SET status='validated',validated_at=now(),validated_by_user_id=auth.uid() WHERE id=r.id;
  RETURN jsonb_build_object('redemptionId',r.id,'status','validated','validatedAt',now());
END;
$$;
REVOKE ALL ON FUNCTION public.create_benefit_voucher(uuid,uuid),public.redeem_benefit_voucher(text),public.request_workshop_change(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_benefit_voucher(uuid,uuid),public.redeem_benefit_voucher(text),public.request_workshop_change(uuid) TO authenticated;
COMMIT;
