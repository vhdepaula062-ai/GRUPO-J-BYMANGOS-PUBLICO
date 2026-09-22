BEGIN;
-- Copy legacy agenda records deterministically. Retain source JSON for reviewed retention.
INSERT INTO public.appointments(id,workshop_id,customer_name,customer_phone,vehicle_info,service_type,appointment_date,shift,status,notes)
SELECT md5(split_part(r.key,':',2)||':'||(entry->>'id'))::uuid,split_part(r.key,':',2)::uuid,
  entry->>'customerName',entry->>'phone',entry->>'vehicle',entry->>'service',(entry->>'date')::date,
  entry->>'shift',entry->>'status',entry->>'notes'
FROM public.remote_configurations r CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(r.value)='array' THEN r.value ELSE '[]'::jsonb END) entry
WHERE r.key ~ '^appointments:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
ON CONFLICT(id) DO NOTHING;
DROP POLICY IF EXISTS "Oficinas podem gerenciar seus agendamentos" ON public.appointments;
CREATE POLICY "active operators manage own appointments" ON public.appointments FOR ALL TO authenticated
USING(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=appointments.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')))
WITH CHECK(public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=appointments.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')));
REVOKE DELETE ON public.appointments FROM authenticated;
DROP POLICY IF EXISTS "workshops create service orders" ON public.service_orders;
CREATE POLICY "active operators create scoped service orders" ON public.service_orders FOR INSERT TO authenticated
WITH CHECK(opened_by=auth.uid() AND EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
  WHERE m.user_id=auth.uid() AND m.organization_id=service_orders.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant'))
  AND EXISTS(SELECT 1 FROM public.customers c WHERE c.id=service_orders.customer_id AND c.assigned_workshop_id=service_orders.workshop_id)
  AND EXISTS(SELECT 1 FROM public.vehicles v WHERE v.id=service_orders.vehicle_id AND v.customer_id=service_orders.customer_id AND v.is_active)
  AND (redemption_id IS NULL OR EXISTS(SELECT 1 FROM public.benefit_redemptions r WHERE r.id=service_orders.redemption_id AND r.customer_id=service_orders.customer_id AND r.vehicle_id=service_orders.vehicle_id AND r.workshop_id=service_orders.workshop_id AND r.status IN ('validated','in_progress'))));
GRANT INSERT ON public.service_orders TO authenticated;
REVOKE UPDATE ON public.service_orders FROM authenticated;
GRANT UPDATE(status,notes,odometer_km,completed_at,updated_at) ON public.service_orders TO authenticated;
COMMIT;
