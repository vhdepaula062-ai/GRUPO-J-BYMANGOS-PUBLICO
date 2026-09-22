BEGIN;

-- Validate the current signed session, never the user's global last login.
CREATE FUNCTION public.has_recent_session(p_max_age_minutes integer DEFAULT 15)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT COALESCE(public.is_session_permitted() AND p_max_age_minutes BETWEEN 1 AND 15
 AND EXISTS(SELECT 1 FROM auth.sessions s
   WHERE s.id::text = auth.jwt()->>'session_id' AND s.user_id=auth.uid()
   AND s.created_at BETWEEN now()-make_interval(mins=>p_max_age_minutes) AND now()),false);
$$;
REVOKE ALL ON FUNCTION public.has_recent_session(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_recent_session(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.manage_platform_admin(p_email text,p_enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE target uuid; v_role_id uuid;
BEGIN
 IF public.has_recent_session() IS NOT TRUE THEN RAISE EXCEPTION 'RECENT_AUTHENTICATION_REQUIRED'; END IF;
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=auth.uid() AND r.code='platform_owner') THEN RAISE EXCEPTION 'OWNER_REQUIRED'; END IF;
 SELECT id INTO target FROM profiles WHERE lower(email)=lower(trim(p_email));
 IF target IS NULL OR target=auth.uid() OR p_enabled IS NULL THEN RAISE EXCEPTION 'INVALID_MEMBER'; END IF;
 PERFORM 1 FROM profiles WHERE id=target FOR UPDATE;
 IF EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=target AND r.code='platform_owner') THEN RAISE EXCEPTION 'OWNER_PROTECTED'; END IF;
 SELECT id INTO v_role_id FROM roles WHERE code='platform_admin';
 IF p_enabled THEN
  INSERT INTO user_roles(user_id,role_id) VALUES(target,v_role_id) ON CONFLICT DO NOTHING;
 ELSE
  DELETE FROM user_roles ur WHERE ur.user_id=target AND ur.role_id=v_role_id;
 END IF;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason) VALUES(auth.uid(),'user_roles',target,CASE WHEN p_enabled THEN 'admin_granted' ELSE 'admin_revoked' END,'Gestão de acesso pelo proprietário');
END; $$;

-- Preserve assignment history while revoking obsolete operational access.
UPDATE public.workshop_assignments a SET is_active=false FROM public.customers c
WHERE c.id=a.customer_id AND a.is_active AND c.assigned_workshop_id IS DISTINCT FROM a.workshop_id;
CREATE FUNCTION public.revoke_obsolete_workshop_assignments() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 UPDATE workshop_assignments SET is_active=false WHERE customer_id=NEW.id
 AND is_active AND workshop_id IS DISTINCT FROM NEW.assigned_workshop_id;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.revoke_obsolete_workshop_assignments() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER revoke_obsolete_workshop_assignments AFTER UPDATE OF assigned_workshop_id ON public.customers
FOR EACH ROW WHEN(OLD.assigned_workshop_id IS DISTINCT FROM NEW.assigned_workshop_id)
EXECUTE FUNCTION public.revoke_obsolete_workshop_assignments();

CREATE FUNCTION public.decommission_workshop(p_org uuid,p_fallback uuid DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE customer_row record;
BEGIN
 IF public.is_session_permitted() IS NOT TRUE OR public.is_platform_admin() IS NOT TRUE THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF p_org IS NULL OR p_org=p_fallback THEN RAISE EXCEPTION 'INVALID_WORKSHOP'; END IF;
 PERFORM 1 FROM organizations WHERE id IN(p_org,p_fallback) ORDER BY id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM organizations WHERE id=p_org) THEN RAISE EXCEPTION 'WORKSHOP_NOT_FOUND'; END IF;
 IF p_fallback IS NOT NULL AND NOT EXISTS(SELECT 1 FROM organizations WHERE id=p_fallback AND status='active') THEN RAISE EXCEPTION 'FALLBACK_NOT_ACTIVE'; END IF;
 FOR customer_row IN SELECT id FROM customers WHERE assigned_workshop_id=p_org ORDER BY id FOR UPDATE LOOP
  UPDATE customers SET assigned_workshop_id=p_fallback,workshop_assigned_at=now() WHERE id=customer_row.id;
  IF p_fallback IS NOT NULL THEN
   INSERT INTO workshop_assignment_history(customer_id,previous_workshop_id,new_workshop_id,assigned_at,reason)
   VALUES(customer_row.id,p_org,p_fallback,now(),'Realocação administrativa por descredenciamento');
  END IF;
 END LOOP;
 UPDATE workshop_assignments SET is_active=false WHERE workshop_id=p_org AND is_active;
 UPDATE organizations SET status='inactive',updated_at=now() WHERE id=p_org;
 INSERT INTO audit_logs(actor_user_id,entity_name,entity_id,action,reason)
 VALUES(auth.uid(),'organizations',p_org,'decommission','Descredenciamento e realocação: '||COALESCE(p_fallback::text,'sem oficina substituta'));
END; $$;
REVOKE ALL ON FUNCTION public.decommission_workshop(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.decommission_workshop(uuid,uuid) TO authenticated;
COMMIT;
