BEGIN;
CREATE FUNCTION public.is_session_permitted() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND COALESCE(to_jsonb(u)->'raw_app_meta_data'->>'account_status','active')<>'suspended' AND (NULLIF(to_jsonb(u)->>'banned_until','') IS NULL OR (to_jsonb(u)->>'banned_until')::timestamptz<=now()))
 AND (COALESCE(auth.jwt()->>'aal','aal1')='aal2' OR NOT EXISTS(SELECT 1 FROM auth.mfa_factors WHERE user_id=auth.uid() AND status='verified'));
$$;
REVOKE ALL ON FUNCTION public.is_session_permitted() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_session_permitted() TO anon,authenticated,service_role;
-- Restrictions apply even when a previously issued token has not expired.
DO $$ DECLARE t text; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
  EXECUTE format('CREATE POLICY session_must_be_permitted ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((SELECT public.is_session_permitted())) WITH CHECK ((SELECT public.is_session_permitted()))',t);
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.is_platform_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT is_session_permitted() AND EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=auth.uid() AND r.code IN ('platform_owner','platform_admin'));
$$;
CREATE OR REPLACE FUNCTION public.get_user_organization_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active AND is_session_permitted() ORDER BY created_at LIMIT 1;
$$;
-- SECURITY DEFINER bypasses RLS, so every user-callable mutation receives the same guard.
DO $$ DECLARE f record; definition text; BEGIN
 FOR f IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('create_benefit_voucher','redeem_benefit_voucher','request_workshop_change','open_portal_request','reply_portal_request','save_ecosystem_settings','cancel_own_subscription','advance_service_order','manage_workshop_member','manage_platform_admin','create_catalog_plan','grant_trial_subscription','request_own_erasure','get_own_benefit_balances') LOOP
  definition:=pg_get_functiondef(f.oid);
  IF position('BEGIN' IN definition)=0 THEN RAISE EXCEPTION 'SESSION_GUARD_NOT_INSERTED'; END IF;
  definition:=regexp_replace(definition,'BEGIN',E'BEGIN\n IF NOT public.is_session_permitted() THEN RAISE EXCEPTION ''SESSION_NOT_PERMITTED''; END IF;\n');
  EXECUTE definition;
 END LOOP;
END $$;
CREATE FUNCTION public.check_in_voucher(p_token text,p_plate text DEFAULT NULL,p_odometer integer DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r benefit_redemptions; actual_plate text; result jsonb;
BEGIN
 IF NOT is_session_permitted() THEN RAISE EXCEPTION 'SESSION_NOT_PERMITTED'; END IF;
 SELECT * INTO r FROM benefit_redemptions WHERE voucher_token=upper(trim(p_token)) AND workshop_id=get_user_organization_id();
 IF r.id IS NULL THEN RAISE EXCEPTION 'VOUCHER_NOT_FOUND'; END IF;
 IF p_odometer<0 OR p_odometer>10000000 THEN RAISE EXCEPTION 'INVALID_ODOMETER'; END IF;
 SELECT plate_clean INTO actual_plate FROM vehicles WHERE id=r.vehicle_id;
 IF NULLIF(trim(p_plate),'') IS NOT NULL AND upper(regexp_replace(p_plate,'[^a-zA-Z0-9]','','g'))<>actual_plate THEN RAISE EXCEPTION 'VEHICLE_MISMATCH'; END IF;
 result:=redeem_benefit_voucher(upper(trim(p_token)));
 UPDATE service_orders SET odometer_km=p_odometer WHERE redemption_id=r.id;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.check_in_voucher(text,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.check_in_voucher(text,text,integer) TO authenticated;
COMMIT;
