BEGIN;
CREATE TABLE public.request_rate_windows(key text PRIMARY KEY CHECK(length(key)<=200),count integer NOT NULL,reset_at timestamptz NOT NULL);
CREATE INDEX ON public.request_rate_windows(reset_at);
ALTER TABLE public.request_rate_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.request_rate_windows FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.request_rate_windows TO service_role;
CREATE FUNCTION public.consume_request_limit(p_key text,p_max integer,p_window_seconds integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r request_rate_windows;
BEGIN
 IF p_key IS NULL OR length(p_key) NOT BETWEEN 32 AND 200 OR p_max IS NULL OR p_max NOT BETWEEN 1 AND 10000 OR p_window_seconds IS NULL OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN RAISE EXCEPTION 'INVALID_RATE_LIMIT'; END IF;
 DELETE FROM request_rate_windows WHERE key IN (SELECT key FROM request_rate_windows WHERE reset_at<now()-interval '1 hour' LIMIT 100);
 INSERT INTO request_rate_windows AS w(key,count,reset_at) VALUES(p_key,1,now()+make_interval(secs=>p_window_seconds))
 ON CONFLICT(key) DO UPDATE SET count=CASE WHEN w.reset_at<=now() THEN 1 ELSE least(w.count+1,p_max+1) END,reset_at=CASE WHEN w.reset_at<=now() THEN EXCLUDED.reset_at ELSE w.reset_at END RETURNING * INTO r;
 RETURN jsonb_build_object('allowed',r.count<=p_max,'retryAfter',greatest(1,ceil(extract(epoch FROM r.reset_at-now()))));
END; $$;
REVOKE ALL ON FUNCTION public.consume_request_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_request_limit(text,integer,integer) TO service_role;
-- One request per caller transaction; no anonymous bulk protocol generation.
CREATE FUNCTION public.request_own_erasure() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r account_erasure_requests;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
 PERFORM 1 FROM profiles WHERE id=auth.uid() FOR UPDATE;
 SELECT * INTO r FROM account_erasure_requests WHERE user_id=auth.uid() AND status IN ('requested','identity_check','approved','processing') ORDER BY requested_at DESC LIMIT 1;
 IF r.id IS NULL THEN
  IF EXISTS(SELECT 1 FROM account_erasure_requests WHERE user_id=auth.uid() AND requested_at>now()-interval '1 day') THEN RAISE EXCEPTION 'REQUEST_LIMIT'; END IF;
  INSERT INTO account_erasure_requests(user_id,protocol,deadline_at) VALUES(auth.uid(),'LGPD-'||upper(replace(gen_random_uuid()::text,'-','')),now()+interval '15 days') RETURNING * INTO r;
 END IF;
 RETURN jsonb_build_object('protocol',r.protocol,'status',r.status,'deadline_at',r.deadline_at);
END; $$;
REVOKE INSERT ON public.account_erasure_requests FROM authenticated;
REVOKE ALL ON FUNCTION public.request_own_erasure() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.request_own_erasure() TO authenticated;
COMMIT;
