BEGIN;

CREATE TABLE public.portal_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 protocol text NOT NULL UNIQUE DEFAULT ('GJ-'||upper(replace(gen_random_uuid()::text,'-',''))),
 user_id uuid NOT NULL REFERENCES public.profiles(id),
 workshop_id uuid REFERENCES public.organizations(id),
 kind text NOT NULL CHECK(kind IN ('support','privacy')),
 subject text NOT NULL CHECK(length(subject) BETWEEN 5 AND 160),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','answered','closed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.portal_request_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL REFERENCES public.portal_requests(id),
 author_id uuid NOT NULL REFERENCES public.profiles(id),
 from_admin boolean NOT NULL,
 body text NOT NULL CHECK(length(body) BETWEEN 5 AND 4000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.portal_requests(user_id,created_at DESC);
CREATE INDEX ON public.portal_request_messages(request_id,created_at);
ALTER TABLE public.portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_request_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "request owner or admin reads" ON public.portal_requests FOR SELECT TO authenticated
 USING(user_id=auth.uid() OR public.is_platform_admin());
CREATE POLICY "request messages recipient reads" ON public.portal_request_messages FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.portal_requests r WHERE r.id=request_id));
REVOKE ALL ON public.portal_requests,public.portal_request_messages FROM anon,authenticated;
GRANT SELECT ON public.portal_requests,public.portal_request_messages TO authenticated;
GRANT ALL ON public.portal_requests,public.portal_request_messages TO service_role;

CREATE TABLE public.user_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id),
 title text NOT NULL, message text NOT NULL, entity_type text NOT NULL, entity_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),read_at timestamptz
);
CREATE INDEX ON public.user_notifications(user_id,created_at DESC,id DESC);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own notifications" ON public.user_notifications FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "user acknowledges own notifications" ON public.user_notifications FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
REVOKE ALL ON public.user_notifications FROM anon,authenticated;
GRANT SELECT,UPDATE(read_at) ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;

CREATE FUNCTION public.open_portal_request(p_kind text,p_subject text,p_body text) RETURNS uuid
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE request_id uuid; org uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
 IF p_kind NOT IN ('support','privacy') OR length(trim(p_subject)) NOT BETWEEN 5 AND 160 OR length(trim(p_body)) NOT BETWEEN 5 AND 4000 THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 PERFORM 1 FROM profiles WHERE id=auth.uid() FOR UPDATE;
 IF (SELECT count(*) FROM portal_requests WHERE user_id=auth.uid() AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'REQUEST_LIMIT'; END IF;
 IF p_kind='support' THEN org:=get_user_organization_id(); END IF;
 INSERT INTO portal_requests(user_id,workshop_id,kind,subject) VALUES(auth.uid(),org,p_kind,trim(p_subject)) RETURNING id INTO request_id;
 INSERT INTO portal_request_messages(request_id,author_id,from_admin,body) VALUES(request_id,auth.uid(),false,trim(p_body));
 RETURN request_id;
END; $$;

CREATE FUNCTION public.reply_portal_request(p_id uuid,p_body text,p_status text DEFAULT NULL) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r portal_requests; admin boolean:=is_platform_admin();
BEGIN
 SELECT * INTO r FROM portal_requests WHERE id=p_id FOR UPDATE;
 IF auth.uid() IS NULL OR r.id IS NULL OR NOT(admin OR r.user_id=auth.uid()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF COALESCE(length(trim(p_body)),0) NOT BETWEEN 5 AND 4000 THEN RAISE EXCEPTION 'INVALID_MESSAGE'; END IF;
 IF p_status IS NOT NULL AND (NOT admin OR p_status NOT IN ('open','in_progress','answered','closed')) THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
 IF (SELECT count(*) FROM portal_request_messages WHERE request_id=r.id AND author_id=auth.uid() AND created_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'REQUEST_LIMIT'; END IF;
 INSERT INTO portal_request_messages(request_id,author_id,from_admin,body) VALUES(r.id,auth.uid(),admin,trim(p_body));
 UPDATE portal_requests SET status=CASE WHEN admin THEN COALESCE(p_status,'answered') ELSE 'open' END,updated_at=now() WHERE id=r.id;
END; $$;

CREATE FUNCTION public.notify_request_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r portal_requests; k text:='request-message:'||NEW.id;
BEGIN
 SELECT * INTO r FROM portal_requests WHERE id=NEW.request_id;
 INSERT INTO operational_notifications(event_key,audience,entity_type,entity_id,title,message,severity)
 VALUES(k,'admin','portal_requests',r.id,CASE WHEN r.kind='privacy' THEN 'Pedido de privacidade atualizado' ELSE 'Chamado de suporte atualizado' END,'Consulte o protocolo no atendimento.',CASE WHEN r.kind='privacy' THEN 'critical' ELSE 'info' END);
 IF NEW.from_admin THEN
  INSERT INTO user_notifications(user_id,title,message,entity_type,entity_id) VALUES(r.user_id,'Resposta ao seu protocolo','Consulte a resposta no atendimento.','portal_requests',r.id);
  IF r.workshop_id IS NOT NULL THEN
   INSERT INTO operational_notifications(event_key,audience,organization_id,entity_type,entity_id,title,message,severity)
   VALUES(k,'workshop',r.workshop_id,'portal_requests',r.id,'Resposta ao chamado','O solicitante pode consultar a resposta no atendimento.','info');
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER request_message_notification AFTER INSERT ON public.portal_request_messages FOR EACH ROW EXECUTE FUNCTION public.notify_request_message();

CREATE FUNCTION public.notify_customer_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v jsonb:=to_jsonb(NEW); customer uuid; recipient uuid; title text;
BEGIN
 IF TG_OP='UPDATE' AND to_jsonb(OLD)->>'status' IS NOT DISTINCT FROM v->>'status' AND to_jsonb(OLD)->>'cancel_at_period_end' IS NOT DISTINCT FROM v->>'cancel_at_period_end' THEN RETURN NEW; END IF;
 customer:=(v->>'customer_id')::uuid;
 IF TG_TABLE_NAME='payments' THEN SELECT customer_id INTO customer FROM subscriptions WHERE id=(v->>'subscription_id')::uuid; END IF;
 IF TG_TABLE_NAME='account_erasure_requests' THEN recipient:=NEW.user_id; ELSE SELECT profile_id INTO recipient FROM customers WHERE id=customer; END IF;
 IF recipient IS NULL THEN RETURN NEW; END IF;
 title:=CASE TG_TABLE_NAME WHEN 'subscriptions' THEN 'Sua assinatura foi atualizada' WHEN 'payments' THEN 'Atualização de pagamento' WHEN 'service_orders' THEN 'Atualização do atendimento' WHEN 'benefit_redemptions' THEN 'Atualização do benefício' ELSE 'Atualização do pedido de privacidade' END;
 INSERT INTO user_notifications(user_id,title,message,entity_type,entity_id) VALUES(recipient,title,'Confira os detalhes na sua conta.',TG_TABLE_NAME,NEW.id);
 RETURN NEW;
END; $$;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['subscriptions','payments','service_orders','benefit_redemptions','account_erasure_requests'] LOOP
  EXECUTE format('CREATE TRIGGER customer_notification AFTER INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.notify_customer_event()',t);
 END LOOP;
END $$;

CREATE TABLE public.configuration_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version integer NOT NULL UNIQUE,value jsonb NOT NULL,
 actor_id uuid NOT NULL REFERENCES profiles(id),created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.configuration_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads config history" ON public.configuration_revisions FOR SELECT TO authenticated USING(is_platform_admin());
REVOKE ALL ON public.configuration_revisions FROM anon,authenticated;
GRANT SELECT ON public.configuration_revisions TO authenticated;
GRANT ALL ON public.configuration_revisions TO service_role;
INSERT INTO remote_configurations(key,value,description) VALUES('ecosystem_settings','{"controllerName":"","controllerDocument":"","privacyEmail":"","supportEmail":"","privacyText":"","termsText":"","legalPublished":false}', 'Configuração pública aprovada e contatos oficiais') ON CONFLICT(key) DO NOTHING;
CREATE FUNCTION public.save_ecosystem_settings(p_value jsonb,p_expected_version integer) RETURNS integer
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE c remote_configurations;
BEGIN
 IF NOT is_platform_admin() THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF jsonb_typeof(p_value)<>'object' OR octet_length(p_value::text)>100000 THEN RAISE EXCEPTION 'INVALID_CONFIG'; END IF;
 SELECT * INTO c FROM remote_configurations WHERE key='ecosystem_settings' FOR UPDATE;
 IF c.version IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION 'VERSION_CONFLICT'; END IF;
 IF COALESCE((p_value->>'legalPublished')::boolean,false) AND (length(trim(COALESCE(p_value->>'controllerName','')))<3 OR length(trim(COALESCE(p_value->>'controllerDocument','')))<11 OR COALESCE(p_value->>'privacyEmail','') NOT LIKE '%@%.%' OR length(COALESCE(p_value->>'privacyText',''))<100 OR length(COALESCE(p_value->>'termsText',''))<100) THEN RAISE EXCEPTION 'LEGAL_DETAILS_REQUIRED'; END IF;
 INSERT INTO configuration_revisions(version,value,actor_id) VALUES(c.version,c.value,auth.uid()) ON CONFLICT(version) DO NOTHING;
 UPDATE remote_configurations SET value=p_value,version=version+1,updated_by=auth.uid(),updated_at=now() WHERE id=c.id;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'remote_configurations',c.id,'publish','Nova versão de configuração');
 RETURN c.version+1;
END; $$;

-- Cancellation does not assert a refund or a gateway cancellation.
CREATE FUNCTION public.cancel_own_subscription(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s subscriptions;
BEGIN
 SELECT * INTO s FROM subscriptions WHERE id=p_id FOR UPDATE;
 IF auth.uid() IS NULL OR s.id IS NULL OR NOT(EXISTS(SELECT 1 FROM customers WHERE id=s.customer_id AND profile_id=auth.uid()) OR EXISTS(SELECT 1 FROM organization_members WHERE organization_id=s.organization_id AND user_id=auth.uid() AND is_active AND role IN ('owner','manager'))) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF s.gateway_subscription_id IS NOT NULL THEN RAISE EXCEPTION 'GATEWAY_NOT_CONFIGURED'; END IF;
 IF s.cancel_at_period_end OR s.status='canceled' THEN RETURN; END IF;
 UPDATE subscriptions SET cancel_at_period_end=true,updated_at=now() WHERE id=s.id;
 INSERT INTO subscription_status_history(subscription_id,previous_status,new_status,reason) VALUES(s.id,s.status,s.status,'Cancelamento solicitado para o fim da vigência');
END; $$;

-- Create the service order atomically with voucher validation, including existing vouchers.
ALTER TABLE public.benefit_redemptions ADD COLUMN IF NOT EXISTS completed_at timestamptz;
CREATE FUNCTION public.ensure_redemption_order() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.status='validated' AND OLD.status='requested' THEN
  INSERT INTO service_orders(protocol,customer_id,vehicle_id,workshop_id,redemption_id,status,opened_by)
  SELECT 'OS-'||upper(replace(NEW.id::text,'-','')),NEW.customer_id,NEW.vehicle_id,NEW.workshop_id,NEW.id,'open',NEW.validated_by_user_id
  WHERE NOT EXISTS(SELECT 1 FROM service_orders WHERE redemption_id=NEW.id);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER redemption_creates_order AFTER UPDATE ON public.benefit_redemptions FOR EACH ROW EXECUTE FUNCTION public.ensure_redemption_order();
INSERT INTO service_orders(protocol,customer_id,vehicle_id,workshop_id,redemption_id,status,opened_by,completed_at)
SELECT 'OS-'||upper(replace(r.id::text,'-','')),r.customer_id,r.vehicle_id,r.workshop_id,r.id,CASE r.status WHEN 'completed' THEN 'completed' WHEN 'in_progress' THEN 'in_progress' ELSE 'open' END,r.validated_by_user_id,CASE WHEN r.status='completed' THEN r.completed_at ELSE NULL END
FROM benefit_redemptions r WHERE r.status IN ('validated','in_progress','completed') AND r.validated_by_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM service_orders o WHERE o.redemption_id=r.id);

CREATE FUNCTION public.advance_service_order(p_id uuid,p_status text,p_notes text DEFAULT '',p_odometer integer DEFAULT NULL) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE o service_orders;
BEGIN
 SELECT * INTO o FROM service_orders WHERE id=p_id FOR UPDATE;
 IF o.id IS NULL OR NOT EXISTS(SELECT 1 FROM organization_members m JOIN organizations g ON g.id=m.organization_id WHERE m.user_id=auth.uid() AND m.organization_id=o.workshop_id AND m.is_active AND g.status='active' AND m.role IN ('owner','manager','attendant')) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF o.status IN ('completed','canceled') OR NOT ((o.status='open' AND p_status IN ('in_progress','canceled')) OR (o.status='in_progress' AND p_status IN ('completed','canceled'))) THEN RAISE EXCEPTION 'INVALID_TRANSITION'; END IF;
 IF length(COALESCE(p_notes,''))>4000 OR p_odometer<0 OR (o.odometer_km IS NOT NULL AND p_odometer<o.odometer_km) THEN RAISE EXCEPTION 'INVALID_SERVICE_DATA'; END IF;
 UPDATE service_orders SET status=p_status,notes=COALESCE(NULLIF(trim(p_notes),''),notes),odometer_km=COALESCE(p_odometer,odometer_km),completed_at=CASE WHEN p_status='completed' THEN now() ELSE NULL END,updated_at=now() WHERE id=o.id;
 IF o.redemption_id IS NOT NULL THEN UPDATE benefit_redemptions SET status=p_status,completed_at=CASE WHEN p_status='completed' THEN now() ELSE NULL END WHERE id=o.redemption_id; END IF;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'service_orders',o.id,p_status,'Alteração de atendimento');
END; $$;
-- All state transitions must go through the validated RPC.
REVOKE UPDATE ON public.service_orders FROM authenticated;
REVOKE UPDATE(status,notes,odometer_km,completed_at,updated_at) ON public.service_orders FROM authenticated;

DO $$ DECLARE f regprocedure; BEGIN
 FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('open_portal_request','reply_portal_request','save_ecosystem_settings','cancel_own_subscription','advance_service_order') LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon',f);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f);
 END LOOP;
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications,public.portal_requests,public.portal_request_messages; END IF;
END $$;
COMMIT;
