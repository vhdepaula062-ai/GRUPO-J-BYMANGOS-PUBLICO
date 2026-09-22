BEGIN;
-- Promotion status/moderation is only written by the authorized server actions.
REVOKE INSERT,UPDATE,DELETE ON public.promotions FROM authenticated;
DROP POLICY IF EXISTS "workshops update service orders" ON public.service_orders;
CREATE POLICY "active operators update own service orders" ON public.service_orders FOR UPDATE TO authenticated
USING(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=service_orders.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')))
WITH CHECK(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=service_orders.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')));
DROP POLICY IF EXISTS "members manage workshop services" ON public.workshop_services;
CREATE POLICY "active managers manage own workshop services" ON public.workshop_services FOR ALL TO authenticated
USING(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=workshop_services.organization_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager')))
WITH CHECK(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=workshop_services.organization_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager')));
COMMIT;
