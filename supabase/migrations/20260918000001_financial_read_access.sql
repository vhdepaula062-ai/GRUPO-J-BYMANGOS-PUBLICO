-- Financial SELECT is scoped through subscription ownership, never customer assignment.
-- Run with the normal migration pipeline. No payments or balances are created here.
CREATE POLICY "owners read benefit entitlements" ON public.entitlements
FOR SELECT TO authenticated USING (
  public.is_platform_admin() OR customer_id IN (SELECT c.id FROM public.customers c WHERE c.profile_id = auth.uid())
);
CREATE POLICY "owners read workshop assignments" ON public.workshop_assignments
FOR SELECT TO authenticated USING (
  public.is_platform_admin() OR workshop_id = public.get_user_organization_id()
  OR customer_id IN (SELECT c.id FROM public.customers c WHERE c.profile_id = auth.uid())
);
CREATE POLICY "subscription owners read payments" ON public.payments
FOR SELECT TO authenticated USING (
  public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.id = payments.subscription_id
    AND (s.customer_id IN (SELECT c.id FROM public.customers c WHERE c.profile_id = auth.uid())
      OR s.organization_id = public.get_user_organization_id())
  )
);
CREATE POLICY "subscription owners read invoices" ON public.invoices
FOR SELECT TO authenticated USING (
  public.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.id = invoices.subscription_id
    AND (s.customer_id IN (SELECT c.id FROM public.customers c WHERE c.profile_id = auth.uid())
      OR s.organization_id = public.get_user_organization_id())
  )
);

DO $$
DECLARE t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['payments', 'subscriptions', 'invoices', 'plans'] LOOP
      IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END $$;
