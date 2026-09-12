-- ==============================================================================
-- TESTES DE ISOLAMENTO RLS MULTIEMPRESA (pgTAP / SQL)
-- Objetivo: Provar matematicamente que Oficina A NÃO lê dados de Oficina B
-- ==============================================================================

BEGIN;

-- 1. Criação de dois perfis de teste de oficinas concorrentes
INSERT INTO profiles (id, full_name, email)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Gerente Oficina A', 'gerente@oficina-a.com.br'),
('b0000000-0000-0000-0000-000000000001', 'Gerente Oficina B', 'gerente@oficina-b.com.br')
ON CONFLICT (id) DO NOTHING;

-- 2. Vinculação em membros
INSERT INTO organization_members (organization_id, user_id, role)
VALUES
('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'manager'),
('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'manager')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. Simulação de contexto de autenticação como Gerente Oficina A
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-000000000001';

-- 4. Teste de Negação: Gerente A tenta ler equipe da Oficina B
DO $$
DECLARE
    foreign_members_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO foreign_members_count
    FROM organization_members
    WHERE organization_id = '40000000-0000-0000-0000-000000000002';

    IF foreign_members_count > 0 THEN
        RAISE EXCEPTION 'FALHA GRAVE DE SEGURANÇA: Usuário da Oficina A conseguiu visualizar registros da Oficina B!';
    END IF;
END;
$$;

ROLLBACK;
