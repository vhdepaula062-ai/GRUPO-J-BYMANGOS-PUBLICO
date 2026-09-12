-- ==============================================================================
-- GRUPO J ECOSYSTEM — SEED EXCLUSIVO DE DESENVOLVIMENTO
-- ATENÇÃO: Contém dados puramente sintéticos. Proibido executar em Produção.
-- ==============================================================================

-- 1. PAPÉIS DE USUÁRIO DO SISTEMA
INSERT INTO roles (id, code, name, description) VALUES
('10000000-0000-0000-0000-000000000001', 'platform_owner', 'Proprietário da Plataforma', 'Autoridade máxima do ecossistema Grupo J'),
('10000000-0000-0000-0000-000000000002', 'platform_admin', 'Administrador da Plataforma', 'Gestão operacional de oficinas e usuários'),
('10000000-0000-0000-0000-000000000003', 'finance_admin', 'Administrador Financeiro', 'Faturamento, conciliação e isenções'),
('10000000-0000-0000-0000-000000000004', 'support_admin', 'Atendimento e Suporte', 'Suporte a motoristas e oficinas'),
('10000000-0000-0000-0000-000000000005', 'privacy_admin', 'Encarregado de Dados (DPO)', 'Gestão de conformidade com a LGPD'),
('10000000-0000-0000-0000-000000000006', 'auditor', 'Auditor Independente', 'Leitura e conformidade fiscal e operacional'),
('10000000-0000-0000-0000-000000000007', 'workshop_owner', 'Dono de Oficina', 'Responsável legal pela oficina parceira'),
('10000000-0000-0000-0000-000000000008', 'workshop_manager', 'Gerente da Oficina', 'Gestão de atendimentos e mecânicos'),
('10000000-0000-0000-0000-000000000009', 'workshop_attendant', 'Atendente da Oficina', 'Recepção e check-in de veículos'),
('10000000-0000-0000-0000-000000000010', 'workshop_finance', 'Financeiro da Oficina', 'Acesso a faturas da mensalidade'),
('10000000-0000-0000-0000-000000000011', 'customer', 'Motorista Assinante', 'Cliente final usuário do app mobile'),
('10000000-0000-0000-0000-000000000012', 'mangos_support', 'Suporte Técnico Mangos', 'Break-glass temporário auditado')
ON CONFLICT (code) DO NOTHING;

-- 2. PLANOS COMERCIAIS CONFIRMADOS (VALORES EM CENTAVOS)
INSERT INTO plans (id, code, name, description, audience, price_cents, currency, billing_interval_months, is_active, version) VALUES
('20000000-0000-0000-0000-000000000001', 'DRIVER_BASIC_50', 'Assinatura Motorista Grupo J', 'Prevenção e manutenção automotiva regular', 'customer', 5000, 'BRL', 1, true, 1),
('20000000-0000-0000-0000-000000000002', 'WORKSHOP_PARTNER_500', 'Mensalidade Oficina Credenciada', 'Acesso ao SaaS exclusivo Grupo J e rede de motoristas', 'workshop', 50000, 'BRL', 1, true, 1)
ON CONFLICT (code) DO NOTHING;

-- 3. CATÁLOGO INICIAL DE BENEFÍCIOS PREVENTIVOS
INSERT INTO benefit_definitions (id, name, slug, description, periodicity, quantity_per_cycle, grace_period_days, is_included_in_base_plan, is_active) VALUES
('30000000-0000-0000-0000-000000000001', 'Alinhamento 3D e Balanceamento', 'alinhamento-balanceamento', 'Alinhamento de direção a laser e balanceamento de 4 rodas', 'semiannual', 2, 0, true, true),
('30000000-0000-0000-0000-000000000002', 'Cristalização de Para-brisa', 'cristalizacao-parabrisa', 'Aplicação de hidrorrepelente para alta visibilidade em chuva', 'semiannual', 2, 0, true, true),
('30000000-0000-0000-0000-000000000003', 'Check-up Preventivo 50 Itens', 'checkup-preventivo', 'Inspeção computadorizada de freios, suspensão e bateria', 'quarterly', 4, 0, true, true),
('30000000-0000-0000-0000-000000000004', 'Regulagem e Foco de Faróis', 'regulagem-farois', 'Ajuste de alinhamento óptico dos faróis principais e milhas', 'annual', 1, 0, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. VINCULAÇÃO DE BENEFÍCIOS AO PLANO DO MOTORISTA
INSERT INTO benefit_plan_rules (plan_id, benefit_definition_id, is_active) VALUES
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', true)
ON CONFLICT (plan_id, benefit_definition_id) DO NOTHING;

-- 5. OFICINAS PARCEIRAS DE TESTE
INSERT INTO organizations (id, legal_name, trade_name, cnpj_masked, cnpj_blind_index, status, email, phone) VALUES
('40000000-0000-0000-0000-000000000001', 'Auto Mecânica Modelo Barra LTDA', 'Auto Center Barra', '12.345.678/0001-90', 'mock_blind_cnpj_1', 'active', 'contato@autocenterbarra.com.br', '21988880001'),
('40000000-0000-0000-0000-000000000002', 'Centro Automotivo Recreio EIRELI', 'Recreio Motors Auto', '98.765.432/0001-10', 'mock_blind_cnpj_2', 'active', 'contato@recreiomotors.com.br', '21988880002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_units (id, organization_id, name, is_headquarters, address_street, address_number, address_neighborhood, address_city, address_state, address_zip_code, latitude, longitude) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Unidade Principal Barra', true, 'Avenida das Américas', '1500', 'Barra da Tijuca', 'Rio de Janeiro', 'RJ', '22640-100', -23.000371, -43.365894),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Unidade Recreio', true, 'Avenida das Américas', '18000', 'Recreio dos Bandeirantes', 'Rio de Janeiro', 'RJ', '22790-701', -23.018920, -43.489120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workshop_profiles (organization_id, description, rating_average, rating_count, is_open_now) VALUES
('40000000-0000-0000-0000-000000000001', 'Centro automotivo credenciado especializado em suspensão e alinhamento 3D', 4.90, 154, true),
('40000000-0000-0000-0000-000000000002', 'Oficina de confiança com mais de 15 anos de tradição automotiva', 4.85, 92, true)
ON CONFLICT (organization_id) DO NOTHING;
