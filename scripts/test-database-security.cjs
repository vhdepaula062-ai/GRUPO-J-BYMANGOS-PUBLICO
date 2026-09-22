/* Isolated PostgreSQL engine. Uses synthetic fixtures, never production credentials. */
const { PGlite } = require('../artifacts/db-audit/node_modules/@electric-sql/pglite');
const fs = require('node:fs');
let isolatedDb;
const assert = require('node:assert/strict');
(async()=>{
  const db = new PGlite(); isolatedDb=db;
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');
    CREATE TABLE auth.mfa_factors(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,status text);
    CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid NOT NULL,created_at timestamptz NOT NULL);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated,service_role;`);
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) {
    const sql = fs.readFileSync('supabase/migrations/'+file,'utf8').replace(/^CREATE EXTENSION.*$/gm,'');
    try{await db.exec(sql);}catch(e){throw new Error(file+': '+e.message);}
  }
  const admin='00000000-0000-0000-0000-000000000001';
  const owner='00000000-0000-0000-0000-000000000002';
  const outsider='00000000-0000-0000-0000-000000000003';
  const org='00000000-0000-0000-0000-000000000004';
  await db.exec(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
    ('${admin}','admin@fixture.test','{"account_type":"workshop"}'),
    ('${owner}','owner@fixture.test','{"account_type":"workshop"}'),
    ('${outsider}','other@fixture.test','{"account_type":"workshop"}');
    INSERT INTO user_roles(user_id,role_id) SELECT '${admin}',id FROM roles WHERE code='platform_admin';
    INSERT INTO organizations(id,legal_name,trade_name,cnpj_masked,cnpj_blind_index,status,email,phone) VALUES
    ('${org}','Fixture','Fixture','**.***.***/0001-**','fixture-blind-index','active','business@fixture.test','0000000000');
    INSERT INTO organization_members(organization_id,user_id,role,is_active) VALUES('${org}','${owner}','owner',true);`);
  const before=(await db.query('SELECT count(*)::int AS n FROM operational_notifications')).rows[0].n;
  await db.exec(`UPDATE organizations SET status='suspended' WHERE id='${org}';`);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM operational_notifications')).rows[0].n,before+2,'event delivered to admin and workshop');
  await db.exec(`UPDATE organizations SET trade_name='Same state' WHERE id='${org}';`);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM operational_notifications')).rows[0].n,before+2,'no duplicate on irrelevant update');
  await db.exec(`BEGIN; UPDATE organizations SET status='active' WHERE id='${org}'; ROLLBACK;`);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM operational_notifications')).rows[0].n,before+2,'rollback cancels notification');
  // Simulate Supabase default table grants, preserving narrowed grants from migrations.
  await db.exec('GRANT SELECT ON user_roles,roles,organization_members TO authenticated;');
  const claims=async(user)=>db.exec(`RESET ROLE; SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${user}',false); SELECT set_config('request.jwt.claims','{}',false);`);
  await claims(admin);
  const a=await db.query('SELECT id,audience FROM operational_notifications');
  assert(a.rows.length>0 && a.rows.every(x=>x.audience==='admin'),'admin sees admin inbox');
  await claims(owner);
  const owned=await db.query('SELECT id,audience FROM operational_notifications');
  assert(owned.rows.length>0 && owned.rows.every(x=>x.audience==='workshop'),'suspended workshop still sees its alerts');
  const notification=owned.rows[0].id;
  await db.exec(`INSERT INTO notification_reads(notification_id,user_id) VALUES('${notification}','${owner}');`);
  await assert.rejects(db.exec(`INSERT INTO notification_reads(notification_id,user_id) VALUES('${notification}','${outsider}');`),'cannot acknowledge for another user');
  await claims(outsider);
  assert.equal((await db.query('SELECT id FROM operational_notifications')).rows.length,0,'outsider sees no messages');
  await db.exec('RESET ROLE; SET ROLE anon;');
  await assert.rejects(db.query('SELECT cnpj_blind_index FROM organizations'),'anonymous document access denied');
  await assert.rejects(db.query(`SELECT delete_motorista_completely('${org}',null)`),'anonymous erasure RPC denied');
  await db.exec('RESET ROLE;');
  assert.equal((await db.query(`SELECT has_function_privilege('authenticated','public.delete_motorista_completely(uuid,uuid)','EXECUTE') AS allowed`)).rows[0].allowed,false,'destructive RPC revoked');
  const fixture=(n)=>'00000000-0000-0000-0000-'+String(n).padStart(12,'0');
  await db.exec(`INSERT INTO customers(id,profile_id,assigned_workshop_id) VALUES
    ('${fixture(10)}','${owner}','${org}'),('${fixture(11)}','${outsider}','${org}');
    INSERT INTO plans(id,code,name,audience,price_cents) VALUES('${fixture(12)}','audit-fixture','Fixture','customer',100);
    INSERT INTO subscriptions(id,plan_id,customer_id,organization_id,status,current_period_start,current_period_end) VALUES
    ('${fixture(13)}','${fixture(12)}','${fixture(10)}',NULL,'active',now(),now()+interval '1 month'),
    ('${fixture(14)}','${fixture(12)}','${fixture(11)}',NULL,'active',now(),now()+interval '1 month'),
    ('${fixture(15)}','${fixture(12)}',NULL,'${org}','active',now(),now()+interval '1 month');
    INSERT INTO payments(subscription_id,amount_cents,status,payment_method_type)
    SELECT id,100,'paid','fixture' FROM subscriptions;
    INSERT INTO invoices(subscription_id,invoice_number,amount_cents,due_date)
    SELECT id,id::text,100,current_date FROM subscriptions;`);
  await claims(owner);
  assert.equal((await db.query('SELECT id FROM payments')).rows.length,2,'workshop cannot read assigned customer payments');
  assert.equal((await db.query('SELECT id FROM invoices')).rows.length,2,'invoice ownership matches subscription ownership');
  await claims(outsider);
  assert.equal((await db.query('SELECT id FROM payments')).rows.length,1,'second customer sees only own payment');
  await claims(admin);
  assert.equal((await db.query('SELECT id FROM payments')).rows.length,3,'admin sees ecosystem payments');
  await db.exec('RESET ROLE;');
  assert.equal((await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND NOT rowsecurity")).rows.length,0,'all application tables have RLS');
  assert.equal((await db.query("SELECT has_table_privilege('authenticated','promotions','INSERT') OR has_table_privilege('authenticated','promotions','UPDATE') OR has_table_privilege('authenticated','promotions','DELETE') AS allowed")).rows[0].allowed,false,'direct promotion moderation forbidden');
  await db.exec(`INSERT INTO vehicles(id,customer_id,plate,plate_clean,brand,model,model_year,manufacture_year,color)
    VALUES('${fixture(16)}','${fixture(10)}','TST0A01','TST0A01','Fixture','Fixture',2026,2026,'Fixture');
    INSERT INTO service_orders(id,protocol,customer_id,vehicle_id,workshop_id,opened_by)
    VALUES('${fixture(17)}','AUDIT-FIXTURE','${fixture(10)}','${fixture(16)}','${org}','${owner}');`);
  await claims(owner);
  await assert.rejects(db.query(`UPDATE service_orders SET notes='blocked' WHERE id='${fixture(17)}'`));
  await assert.rejects(db.query(`SELECT advance_service_order('${fixture(17)}','in_progress')`));
  await db.exec(`RESET ROLE; UPDATE organizations SET status='active' WHERE id='${org}';`);
  await claims(owner);
  await db.query(`SELECT advance_service_order('${fixture(17)}','in_progress','Inspeção',100)`);
  await assert.rejects(db.query(`SELECT advance_service_order('${fixture(17)}','completed','',99)`));
  await claims(outsider);
  await assert.rejects(db.query(`SELECT advance_service_order('${fixture(17)}','completed')`));
  await claims(owner);
  await db.query(`SELECT advance_service_order('${fixture(17)}','completed','Concluído',110)`);
  await assert.rejects(db.query(`SELECT advance_service_order('${fixture(17)}','in_progress')`));
  assert.equal((await db.query(`SELECT status FROM service_orders WHERE id='${fixture(17)}'`)).rows[0].status,'completed');
  const req=(await db.query(`SELECT open_portal_request('privacy','Teste de acesso','Solicito informações sobre meus dados') AS id`)).rows[0].id;
  await claims(outsider);
  assert.equal((await db.query(`SELECT id FROM portal_requests WHERE id='${req}'`)).rows.length,0);
  assert.equal((await db.query(`SELECT id FROM portal_request_messages WHERE request_id='${req}'`)).rows.length,0);
  await assert.rejects(db.query(`SELECT reply_portal_request('${req}','Tentativa de invasão')`));
  await assert.rejects(db.query(`SELECT cancel_own_subscription('${fixture(13)}')`));
  await assert.rejects(db.query(`SELECT save_ecosystem_settings('{}',1)`));
  await assert.rejects(db.query(`SELECT manage_workshop_member('${org}','owner@fixture.test','owner',true)`));
  await claims(admin);
  await db.query(`SELECT reply_portal_request('${req}','Resposta de teste registrada','answered')`);
  await assert.rejects(db.query(`SELECT save_ecosystem_settings('{}',null)`));
  await assert.rejects(db.query(`SELECT save_ecosystem_settings('{"legalPublished":true}',1)`));
  await db.query(`SELECT save_ecosystem_settings('{"legalPublished":false}',1)`);
  await assert.rejects(db.query(`SELECT save_ecosystem_settings('{}',1)`));
  await assert.rejects(db.query(`SELECT manage_platform_admin('other@fixture.test',true)`));
  await claims(owner);
  assert.equal((await db.query(`SELECT status,workshop_id FROM portal_requests WHERE id='${req}'`)).rows[0].workshop_id,null);
  assert.equal((await db.query(`SELECT status FROM portal_requests WHERE id='${req}'`)).rows[0].status,'answered');
  assert((await db.query(`SELECT id FROM user_notifications WHERE entity_id='${req}'`)).rows.length===1);
  await assert.rejects(db.query(`UPDATE user_notifications SET user_id='${outsider}'`));
  await db.query(`SELECT cancel_own_subscription('${fixture(13)}')`);
  await db.query(`SELECT cancel_own_subscription('${fixture(13)}')`);
  assert.equal((await db.query(`SELECT cancel_at_period_end FROM subscriptions WHERE id='${fixture(13)}'`)).rows[0].cancel_at_period_end,true);
  await db.exec('RESET ROLE;');
  await claims(admin);
  const plan=(await db.query(`SELECT create_catalog_plan('Plano de teste','customer',100,1,'{}'::uuid[]) AS id`)).rows[0].id;
  await assert.rejects(db.query(`SELECT grant_trial_subscription('${plan}','${fixture(10)}',null,30,'Teste de contrato', '${fixture(40)}')`));
  await db.exec(`RESET ROLE; INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES('${fixture(20)}','driver@fixture.test','{"account_type":"customer"}');`);
  const driverCustomer=(await db.query(`SELECT id FROM customers WHERE profile_id='${fixture(20)}'`)).rows[0].id;
  await db.exec(`INSERT INTO benefit_definitions(id,name,slug,periodicity,quantity_per_cycle,grace_period_days) VALUES('${fixture(21)}','Fixture benefit','fixture-benefit','monthly',1,0);
    INSERT INTO benefit_plan_rules(plan_id,benefit_definition_id) VALUES('${plan}','${fixture(21)}');
    UPDATE customers SET assigned_workshop_id='${org}' WHERE id='${driverCustomer}';
    INSERT INTO vehicles(id,customer_id,plate,plate_clean,brand,model,model_year,manufacture_year,color) VALUES('${fixture(22)}','${driverCustomer}','TST0A02','TST0A02','Fixture','Fixture',2026,2026,'Fixture');`);
  await claims(admin);
  await db.query(`SELECT grant_trial_subscription('${plan}','${driverCustomer}',null,30,'Teste sem cobrança','${fixture(23)}')`);
  await db.query(`SELECT grant_trial_subscription('${plan}','${driverCustomer}',null,30,'Teste sem cobrança','${fixture(23)}')`);
  assert.equal((await db.query(`SELECT id FROM payments WHERE subscription_id='${fixture(23)}'`)).rows.length,0,'free trial must not create money');
  await claims(fixture(20));
  await assert.rejects(db.query(`SELECT create_benefit_voucher('${fixture(16)}','${fixture(21)}')`));
  const voucher=(await db.query(`SELECT create_benefit_voucher('${fixture(22)}','${fixture(21)}') AS v`)).rows[0].v;
  assert.equal((await db.query(`SELECT create_benefit_voucher('${fixture(22)}','${fixture(21)}') AS v`)).rows[0].v.id,voucher.id,'issuance idempotent');
  await assert.rejects(db.query(`SELECT redeem_benefit_voucher('${voucher.voucherCode}')`));
  await claims(owner);
  await assert.rejects(db.query(`SELECT check_in_voucher('${voucher.voucherCode}','ERR9Z99',1000)`));
  await db.query(`SELECT check_in_voucher('${voucher.voucherCode}','TST0A02',1000)`);
  await assert.rejects(db.query(`SELECT redeem_benefit_voucher('${voucher.voucherCode}')`));
  const order=(await db.query(`SELECT id FROM service_orders WHERE redemption_id='${voucher.id}'`)).rows[0].id;
  assert.equal(Number((await db.query(`SELECT odometer_km FROM service_orders WHERE id='${order}'`)).rows[0].odometer_km),1000,'check-in odometer persisted');
  await db.query(`SELECT advance_service_order('${order}','in_progress','Teste iniciado',1000)`);
  await db.query(`SELECT advance_service_order('${order}','completed','Teste concluído',1001)`);
  await claims(fixture(20));
  assert.equal((await db.query(`SELECT status FROM service_orders WHERE id='${order}'`)).rows[0].status,'completed','driver sees completed workshop service');
  await assert.rejects(db.query(`SELECT create_benefit_voucher('${fixture(22)}','${fixture(21)}')`));
  const erase=(await db.query(`SELECT request_own_erasure() AS v`)).rows[0].v;
  assert.equal((await db.query(`SELECT request_own_erasure() AS v`)).rows[0].v.protocol,erase.protocol,'erasure request idempotent');
  await assert.rejects(db.query(`SELECT consume_request_limit(repeat('x',64),2,60)`));
  await db.exec('RESET ROLE; SET ROLE service_role;');
  assert.equal((await db.query(`SELECT consume_request_limit(repeat('x',64),2,60) AS v`)).rows[0].v.allowed,true);
  assert.equal((await db.query(`SELECT consume_request_limit(repeat('x',64),2,60) AS v`)).rows[0].v.allowed,true);
  assert.equal((await db.query(`SELECT consume_request_limit(repeat('x',64),2,60) AS v`)).rows[0].v.allowed,false);
  await db.exec('RESET ROLE;');
  // An annual allowance must not reset when the billing month changes.
  await db.exec(`INSERT INTO benefit_definitions(id,name,slug,periodicity,quantity_per_cycle,grace_period_days) VALUES('${fixture(31)}','Annual fixture','annual-fixture','annual',1,0);
    INSERT INTO benefit_plan_rules(plan_id,benefit_definition_id) VALUES('${plan}','${fixture(31)}');
    UPDATE subscriptions SET created_at=now()-interval '2 months',current_period_start=now()-interval '1 month',current_period_end=now()+interval '1 month' WHERE id='${fixture(23)}';
    INSERT INTO benefit_redemptions(customer_id,vehicle_id,workshop_id,benefit_definition_id,status,voucher_token,voucher_expires_at,validated_at,validated_by_user_id) VALUES('${driverCustomer}','${fixture(22)}','${org}','${fixture(31)}','completed','PERIOD-FIXTURE',now()-interval '40 days',now()-interval '40 days','${owner}');`);
  await claims(fixture(20));
  const annual=(await db.query(`SELECT get_own_benefit_balances() AS v`)).rows[0].v.find(x=>x.benefit.id===fixture(31));
  assert.equal(annual.available_quantity,0,'annual benefit retains earlier billing month usage');
  await assert.rejects(db.query(`SELECT create_benefit_voucher('${fixture(22)}','${fixture(31)}')`));
  await db.exec('RESET ROLE;');
  await db.exec(`INSERT INTO auth.mfa_factors(user_id,status) VALUES('${owner}','verified');`);
  await claims(owner);
  assert.equal((await db.query('SELECT is_session_permitted() AS v')).rows[0].v,false,'MFA enrollment blocks AAL1 directly at database');
  assert.equal((await db.query('SELECT id FROM customers')).rows.length,0,'RLS denies weaker session');
  await assert.rejects(db.query(`SELECT open_portal_request('support','Test subject','Test message')`));
  await db.exec(`SELECT set_config('request.jwt.claims','{"aal":"aal2"}',false);`);
  assert.equal((await db.query('SELECT is_session_permitted() AS v')).rows[0].v,true);
  await db.exec('RESET ROLE;');
  // GJ-03: a new login elsewhere cannot refresh an older session's authority.
  await db.exec(`INSERT INTO user_roles(user_id,role_id) SELECT '${admin}',id FROM roles WHERE code='platform_owner';
    INSERT INTO auth.sessions VALUES('${fixture(60)}','${admin}',now()-interval '1 day'),('${fixture(61)}','${admin}',now()),('${fixture(62)}','${outsider}',now()),('${fixture(63)}','${owner}',now());`);
  await claims(owner);
  await db.exec(`SELECT set_config('request.jwt.claims','{"session_id":"${fixture(63)}"}',false);`);
  assert.equal((await db.query('SELECT has_recent_session() AS v')).rows[0].v,false,'missing assurance claim must fail closed, never NULL');
  await claims(admin);
  await assert.rejects(db.query(`SELECT manage_platform_admin('other@fixture.test',true)`),/RECENT_AUTHENTICATION_REQUIRED/);
  await db.exec(`SELECT set_config('request.jwt.claims','{"session_id":"${fixture(60)}"}',false);`);
  await assert.rejects(db.query(`SELECT manage_platform_admin('other@fixture.test',true)`),/RECENT_AUTHENTICATION_REQUIRED/);
  await db.exec(`SELECT set_config('request.jwt.claims','{"session_id":"${fixture(62)}"}',false);`);
  assert.equal((await db.query('SELECT has_recent_session() AS v')).rows[0].v,false,'session must belong to caller');
  await db.exec(`SELECT set_config('request.jwt.claims','{"session_id":"${fixture(61)}"}',false);`);
  await db.query(`SELECT manage_platform_admin('other@fixture.test',true)`);
  await db.query(`SELECT manage_platform_admin('other@fixture.test',false)`);
  assert.equal((await db.query('SELECT has_recent_session(1440) AS v')).rows[0].v,false,'caller cannot extend freshness');
  // GJ-02: transfer is atomic and historic assignments never regain access.
  await db.exec(`RESET ROLE; INSERT INTO organizations(id,legal_name,trade_name,cnpj_masked,cnpj_blind_index,status,email,phone)
    VALUES('${fixture(70)}','Destination','Destination','**.***.***/0001-**','fixture-destination','active','destination@fixture.test','0000000000');
    INSERT INTO workshop_assignments(customer_id,workshop_id,next_change_allowed_at,is_active)
    VALUES('${fixture(11)}','${org}',now()+interval '30 days',true);`);
  await claims(outsider);
  await assert.rejects(db.query(`SELECT decommission_workshop('${org}','${fixture(70)}')`),/FORBIDDEN/);
  await claims(admin);
  await assert.rejects(db.query(`SELECT decommission_workshop('${org}','${fixture(71)}')`),/FALLBACK_NOT_ACTIVE/);
  assert.equal((await db.query(`SELECT assigned_workshop_id FROM customers WHERE id='${fixture(11)}'`)).rows[0].assigned_workshop_id,org,'failed transfer leaves customer unchanged');
  await db.query(`SELECT decommission_workshop('${org}','${fixture(70)}')`);
  assert.equal((await db.query(`SELECT assigned_workshop_id FROM customers WHERE id='${fixture(11)}'`)).rows[0].assigned_workshop_id,fixture(70));
  await db.exec(`RESET ROLE; UPDATE organizations SET status='active' WHERE id='${org}';`);
  assert.equal((await db.query(`SELECT count(*)::int AS n FROM workshop_assignments WHERE workshop_id='${org}' AND is_active`)).rows[0].n,0);
  await claims(owner);
  await db.exec(`SELECT set_config('request.jwt.claims','{"aal":"aal2"}',false);`);
  assert.equal((await db.query(`SELECT id FROM customers WHERE id='${fixture(11)}'`)).rows.length,0,'reactivated old workshop cannot read transferred customer');
  await db.close();
  console.log('PostgreSQL security, financial, service lifecycle, request isolation, cancellation and configuration checks passed; all migrations compiled.');
})().catch(async e=>{console.error(e.message);if(isolatedDb)await isolatedDb.close();process.exitCode=1;});
