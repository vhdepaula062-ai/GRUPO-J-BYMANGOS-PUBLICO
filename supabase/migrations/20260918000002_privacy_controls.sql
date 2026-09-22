-- Must be applied by the database administrator. No personal data is deleted.
BEGIN;
-- The previous definer RPC had no caller check and destroyed retained evidence.
CREATE OR REPLACE FUNCTION public.delete_motorista_completely(p_customer_id uuid, p_profile_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'Eliminação indiscriminada desabilitada. Revisão de identidade e retenção necessária.';
END;
$$;
REVOKE ALL ON FUNCTION public.delete_motorista_completely(uuid,uuid) FROM PUBLIC, anon, authenticated;
-- Consent evidence cannot be forged, rewritten or deleted through direct REST.
DROP POLICY IF EXISTS "users manage own consents" ON public.consent_records;
CREATE POLICY "users read own consent evidence" ON public.consent_records FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_platform_admin());
REVOKE INSERT, UPDATE, DELETE ON public.consent_records FROM anon, authenticated;
-- Profile identity and encrypted/blind documents are server controlled.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name,phone) ON public.profiles TO authenticated;
COMMIT;
