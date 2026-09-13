-- ==============================================================================
-- GRUPO J — SEED DE PRODUÇÃO
-- Este arquivo contém APENAS os dados estruturais do sistema (roles, permissões,
-- configurações da matriz). NÃO contém dados fictícios ou de demonstração.
-- Execute APÓS as migrations: supabase db push
-- ==============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLES DO SISTEMA (RBAC)
-- ----------------------------------------------------------------------------
INSERT INTO roles (id, code, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin',       'Super Administrador',       'Acesso irrestrito a toda a plataforma. Reservado ao proprietário do Grupo J.'),
  ('00000000-0000-0000-0000-000000000002', 'admin',             'Administrador',             'Gestão operacional, financeira e de oficinas. Sem acesso a papéis de usuário.'),
  ('00000000-0000-0000-0000-000000000003', 'dpo',               'Encarregado de Dados (DPO)', 'Acesso exclusivo a registros LGPD, trilha de auditoria e relatórios de impacto.'),
  ('00000000-0000-0000-0000-000000000004', 'financial_manager', 'Gestor Financeiro',         'Conciliação bancária, repasses a oficinas e extração de relatórios financeiros.'),
  ('00000000-0000-0000-0000-000000000005', 'support',           'Suporte & Operações',       'Atendimento a oficinas, moderação de promoções e verificação de check-ins.'),
  ('00000000-0000-0000-0000-000000000006', 'workshop_owner',    'Titular da Oficina',        'Acesso completo ao portal da oficina: equipe, serviços, mensalidade e relatórios.'),
  ('00000000-0000-0000-0000-000000000007', 'workshop_staff',    'Atendente da Oficina',      'Pode validar vouchers e registrar atendimentos. Sem acesso a financeiro ou configurações.'),
  ('00000000-0000-0000-0000-000000000008', 'driver',            'Motorista (Cliente Final)',  'Acesso exclusivo ao aplicativo mobile. Sem acesso a portais web.')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. PERMISSÕES GRANULARES
-- ----------------------------------------------------------------------------
INSERT INTO permissions (code, resource, action, description) VALUES
  -- Organização / Oficinas
  ('org:read',         'organization', 'read',   'Visualizar dados de oficinas'),
  ('org:write',        'organization', 'write',  'Criar e editar oficinas'),
  ('org:approve',      'organization', 'approve','Aprovar credenciamento de oficina'),
  ('org:suspend',      'organization', 'suspend','Suspender ou inativar oficina'),
  -- Assinaturas e Financeiro
  ('sub:read',         'subscription', 'read',   'Visualizar assinaturas de motoristas'),
  ('sub:cancel',       'subscription', 'cancel', 'Cancelar assinatura de motorista'),
  ('fin:read',         'financial',    'read',   'Visualizar extrato financeiro'),
  ('fin:export',       'financial',    'export', 'Exportar relatórios financeiros'),
  -- Benefícios
  ('benefit:read',     'benefit',      'read',   'Visualizar catálogo de benefícios'),
  ('benefit:write',    'benefit',      'write',  'Criar e editar regras de benefícios'),
  -- Promoções
  ('promo:read',       'promotion',    'read',   'Visualizar promoções das oficinas'),
  ('promo:moderate',   'promotion',    'moderate','Aprovar ou recusar promoções'),
  -- Auditoria
  ('audit:read',       'audit',        'read',   'Visualizar trilha de auditoria'),
  -- LGPD / Privacidade
  ('privacy:read',     'privacy',      'read',   'Visualizar solicitações LGPD de titulares'),
  ('privacy:execute',  'privacy',      'execute','Executar anonimização de dados pessoais'),
  -- Usuários Admin
  ('user:read',        'user',         'read',   'Visualizar usuários administrativos'),
  ('user:write',       'user',         'write',  'Convidar e gerenciar usuários administrativos'),
  -- Check-in
  ('checkin:validate', 'checkin',      'validate','Validar voucher de motorista na oficina'),
  ('checkin:read',     'checkin',      'read',   'Visualizar histórico de check-ins'),
  -- Relatórios
  ('report:read',      'report',       'read',   'Visualizar relatórios de desempenho'),
  ('report:export',    'report',       'export', 'Exportar relatórios para CSV')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. CONFIGURAÇÃO DO SISTEMA (Preços e Regras de Negócio)
-- ----------------------------------------------------------------------------

-- Catálogo de benefícios preventivos (4 inclusos no plano base de R$ 50/mês)
INSERT INTO benefit_definitions (
  name, slug, description,
  periodicity, quantity_per_cycle, grace_period_days,
  is_included_in_base_plan, is_active
) VALUES
  (
    'Check-up Preventivo de 30 Itens',
    'checkup-30-itens',
    'Inspeção completa de 30 pontos do veículo: motor, suspensão, freios, pneus, iluminação, fluidos e sistema elétrico. Realizado por técnico certificado com emissão de laudo digital.',
    'quarterly', 1, 7, true, true
  ),
  (
    'Rodízio de Pneus + Calibragem',
    'rodizio-calibragem',
    'Rodízio das 4 rodas com balanceamento básico e calibragem nos padrões do fabricante do veículo. Inclui inspeção visual dos pneus e indicação de desgaste.',
    'quarterly', 1, 7, true, true
  ),
  (
    'Cristalização de Parabrisa',
    'cristalizacao-parabrisa',
    'Aplicação de cristalizante nano-cerâmico no parabrisa para melhorar visibilidade na chuva e repelir insetos. Duração média de 3 meses.',
    'quarterly', 1, 7, true, true
  ),
  (
    'Desinfecção e Aromatização de Cabine',
    'desinfeccao-cabine',
    'Higienização profissional do interior do veículo com produto bactericida e fungicida aprovado pela ANVISA. Elimina 99,9% de bactérias e ácaros.',
    'quarterly', 1, 7, true, true
  )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. NOTA PARA O OPERADOR
-- ----------------------------------------------------------------------------
-- Após rodar este seed, execute o script de onboarding para criar o primeiro
-- administrador do sistema:
--
--   pnpm --filter scripts run create-admin
--
-- Ou acesse o Supabase Dashboard → Authentication → Users → Add User
-- e depois atribua a role 'super_admin' via:
--
--   INSERT INTO user_roles (user_id, role_id)
--   SELECT 'SEU_USER_ID', '00000000-0000-0000-0000-000000000001';
