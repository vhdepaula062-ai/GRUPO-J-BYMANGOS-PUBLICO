BEGIN;
-- Auditor must not inherit every write policy intended for administrators.
CREATE OR REPLACE FUNCTION public.is_platform_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS(SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id=ur.role_id
      WHERE ur.user_id=auth.uid() AND r.code IN ('platform_owner','platform_admin'))
    OR COALESCE(auth.jwt()->'app_metadata'->>'role','') IN ('admin','platform_admin','platform_owner','super_admin')
  );
$$;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO anon,authenticated,service_role;
-- Direct public REST exposed full documents and HMAC identifiers in active workshops.
DROP POLICY IF EXISTS "Leitura pública de oficinas ativas" ON public.organizations;
CREATE POLICY "authorized organization read" ON public.organizations FOR SELECT TO authenticated
USING (id=public.get_user_organization_id() OR public.is_platform_admin() OR EXISTS (
  SELECT 1 FROM public.customers c WHERE c.profile_id=auth.uid() AND c.assigned_workshop_id=organizations.id
));
REVOKE SELECT ON public.organizations FROM anon;
REVOKE SELECT ON public.organizations FROM authenticated;
GRANT SELECT(id,trade_name,legal_name,email,phone,status,created_at,updated_at) ON public.organizations TO authenticated;
-- Financial/identity grants are narrowed even for users with an eligible row.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT(id,full_name,email,phone,cpf_masked,mfa_enabled,created_at,updated_at) ON public.profiles TO authenticated;
REVOKE ALL ON public.user_roles,public.roles,public.organization_members FROM anon;
REVOKE INSERT,UPDATE,DELETE ON public.user_roles,public.roles,public.organization_members FROM authenticated;
GRANT SELECT ON public.user_roles,public.roles,public.organization_members TO authenticated;
-- Business writes occur through validated routes/RPCs, not arbitrary direct inserts.
REVOKE INSERT,DELETE ON public.benefit_redemptions,public.service_orders FROM authenticated;
REVOKE UPDATE ON public.benefit_redemptions FROM authenticated;
-- Existing security-definer voucher RPC retains its own authorization checks.
REVOKE ALL ON FUNCTION public.redeem_benefit_voucher(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.redeem_benefit_voucher(text) TO authenticated;
COMMIT;
