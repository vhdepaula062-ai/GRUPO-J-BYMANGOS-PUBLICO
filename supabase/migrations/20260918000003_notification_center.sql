BEGIN;
CREATE TABLE public.operational_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('admin','workshop')),
  organization_id uuid REFERENCES public.organizations(id),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info','warning','critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((audience = 'admin' AND organization_id IS NULL) OR (audience = 'workshop' AND organization_id IS NOT NULL))
);
CREATE UNIQUE INDEX operational_notifications_dedup ON public.operational_notifications
  (event_key,audience,COALESCE(organization_id,'00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX operational_notifications_inbox ON public.operational_notifications(audience,organization_id,created_at DESC);
CREATE TABLE public.notification_reads (
  notification_id uuid NOT NULL REFERENCES public.operational_notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(notification_id,user_id)
);
ALTER TABLE public.operational_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read recipient notifications" ON public.operational_notifications FOR SELECT TO authenticated
USING ((audience='admin' AND public.is_platform_admin()) OR (audience='workshop' AND EXISTS (
  SELECT 1 FROM public.organization_members m
  WHERE m.user_id=auth.uid() AND m.is_active AND m.organization_id=operational_notifications.organization_id
)));
CREATE POLICY "own receipt select" ON public.notification_reads FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "own receipt insert" ON public.notification_reads FOR INSERT TO authenticated
WITH CHECK(user_id=auth.uid() AND EXISTS (SELECT 1 FROM public.operational_notifications n WHERE n.id=notification_id));
CREATE POLICY "own receipt update" ON public.notification_reads FOR UPDATE TO authenticated
USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS (SELECT 1 FROM public.operational_notifications n WHERE n.id=notification_id));
REVOKE ALL ON public.operational_notifications,public.notification_reads FROM anon,authenticated;
GRANT SELECT ON public.operational_notifications,public.notification_reads TO authenticated;
GRANT INSERT ON public.notification_reads TO authenticated;
GRANT UPDATE(read_at) ON public.notification_reads TO authenticated;
GRANT ALL ON public.operational_notifications,public.notification_reads TO service_role;

-- Same transaction as the business event: a committed event cannot lose its inbox entry.
-- No CPF, phone, email, gateway payload or customer name is copied into notifications.
CREATE FUNCTION public.emit_operational_notification() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
  v jsonb := to_jsonb(NEW);
  previous jsonb;
  org uuid;
  old_org uuid;
  event_key text;
  state text := COALESCE(v->>'status','updated');
  importance text := 'info';
  heading text;
BEGIN
  IF TG_OP='UPDATE' THEN
    previous := to_jsonb(OLD);
    IF previous->>'status' IS NOT DISTINCT FROM v->>'status'
      AND previous->>'assigned_workshop_id' IS NOT DISTINCT FROM v->>'assigned_workshop_id'
      AND previous->>'appointment_date' IS NOT DISTINCT FROM v->>'appointment_date'
      AND previous->>'scheduled_time' IS NOT DISTINCT FROM v->>'scheduled_time'
      AND previous->>'shift' IS NOT DISTINCT FROM v->>'shift' THEN RETURN NEW; END IF;
  END IF;
  CASE TG_TABLE_NAME
    WHEN 'payments' THEN
      SELECT COALESCE(s.organization_id,c.assigned_workshop_id) INTO org FROM public.subscriptions s
      LEFT JOIN public.customers c ON c.id=s.customer_id WHERE s.id=(v->>'subscription_id')::uuid;
      heading := 'Pagamento: ' || state;
      IF state IN ('failed','refunded','charged_back') THEN importance := 'critical'; END IF;
    WHEN 'subscriptions' THEN
      org := (v->>'organization_id')::uuid;
      IF org IS NULL THEN SELECT assigned_workshop_id INTO org FROM public.customers WHERE id=(v->>'customer_id')::uuid; END IF;
      heading := 'Assinatura: ' || state;
      IF state IN ('past_due','failed','canceled','paused') THEN importance := 'warning'; END IF;
    WHEN 'organizations' THEN org := NEW.id; heading := 'Credenciamento: ' || state; importance := 'warning';
    WHEN 'account_erasure_requests' THEN heading := 'Solicitação de privacidade: ' || state; importance := 'critical';
    WHEN 'customers' THEN
      org := (v->>'assigned_workshop_id')::uuid;
      old_org := (previous->>'assigned_workshop_id')::uuid;
      heading := 'Vínculo de motorista atualizado';
    WHEN 'promotions' THEN org := (v->>'workshop_id')::uuid; heading := 'Promoção: ' || state; importance := 'warning';
    ELSE org := (v->>'workshop_id')::uuid; heading := 'Atendimento: ' || state;
  END CASE;
  event_key := TG_TABLE_NAME || ':' || NEW.id || ':' || txid_current() || ':' || state || ':' || COALESCE(org::text,'');
  INSERT INTO public.operational_notifications(event_key,audience,entity_type,entity_id,title,message,severity)
  VALUES(event_key,'admin',TG_TABLE_NAME,NEW.id,heading,'Confira os detalhes no painel autorizado.',importance)
  ON CONFLICT DO NOTHING;
  IF org IS NOT NULL AND TG_TABLE_NAME <> 'account_erasure_requests' THEN
    INSERT INTO public.operational_notifications(event_key,audience,organization_id,entity_type,entity_id,title,message,severity)
    VALUES(event_key,'workshop',org,TG_TABLE_NAME,NEW.id,heading,'Confira os detalhes no painel da sua oficina.',importance)
    ON CONFLICT DO NOTHING;
  END IF;
  IF old_org IS NOT NULL AND old_org IS DISTINCT FROM org THEN
    INSERT INTO public.operational_notifications(event_key,audience,organization_id,entity_type,entity_id,title,message,severity)
    VALUES(event_key,'workshop',old_org,TG_TABLE_NAME,NEW.id,heading,'Um vínculo foi encerrado nesta oficina.','warning') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.emit_operational_notification() FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['payments','subscriptions','organizations','benefit_redemptions','service_orders','appointments','promotions','customers','account_erasure_requests'] LOOP
    EXECUTE format('CREATE TRIGGER trg_operational_notification AFTER INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.emit_operational_notification()',t);
  END LOOP;
END $$;
-- Surface pending tasks that existed before installation; no fabricated financial events.
INSERT INTO public.operational_notifications(event_key,audience,entity_type,entity_id,title,message,severity)
SELECT 'initial:organizations:'||id,'admin','organizations',id,'Oficina aguardando aprovação','Confira a proposta no painel de oficinas.','warning'
FROM public.organizations WHERE status='pending_approval';
INSERT INTO public.operational_notifications(event_key,audience,entity_type,entity_id,title,message,severity)
SELECT 'initial:privacy:'||id,'admin','account_erasure_requests',id,'Pedido de privacidade em aberto','Confira o protocolo e o prazo em Privacidade.','critical'
FROM public.account_erasure_requests WHERE status IN ('requested','identity_check','approved','processing');
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.operational_notifications;
  END IF;
END $$;
COMMIT;
