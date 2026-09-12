-- ==============================================================================
-- GRUPO J ECOSYSTEM — MIGRATION: POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- Versão: 20260912000002
-- ==============================================================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_configurations ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÕES AUXILIARES DE AUTENTICAÇÃO E PAPÉIS
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.code IN ('platform_owner', 'platform_admin', 'auditor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id
    FROM organization_members
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1;

    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLÍTICAS PARA PROFILES
CREATE POLICY "Usuários leem o próprio perfil"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR is_platform_admin());

CREATE POLICY "Usuários atualizam o próprio perfil"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- 4. POLÍTICAS PARA ORGANIZAÇÕES (OFICINAS PARCEIRAS)
CREATE POLICY "Leitura pública de oficinas ativas"
    ON organizations FOR SELECT
    USING (status = 'active' OR id = get_user_organization_id() OR is_platform_admin());

CREATE POLICY "Administradores gerenciam organizações"
    ON organizations FOR ALL
    USING (is_platform_admin());

-- 5. POLÍTICAS PARA MEMBROS DE OFICINAS
CREATE POLICY "Membros leem apenas a própria equipe"
    ON organization_members FOR SELECT
    USING (organization_id = get_user_organization_id() OR is_platform_admin());

-- 6. POLÍTICAS PARA CLIENTES (MOTORISTAS)
CREATE POLICY "Motoristas acessam o próprio cadastro"
    ON customers FOR SELECT
    USING (profile_id = auth.uid() OR is_platform_admin());

CREATE POLICY "Oficinas leem apenas clientes a elas vinculados"
    ON customers FOR SELECT
    USING (assigned_workshop_id = get_user_organization_id());

-- 7. POLÍTICAS PARA VEÍCULOS
CREATE POLICY "Motoristas gerenciam seus veículos"
    ON vehicles FOR ALL
    USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()));

CREATE POLICY "Oficinas leem veículos de clientes vinculados"
    ON vehicles FOR SELECT
    USING (customer_id IN (
        SELECT id FROM customers WHERE assigned_workshop_id = get_user_organization_id()
    ));

-- 8. POLÍTICAS PARA PLANOS E BENEFÍCIOS
CREATE POLICY "Catálogo de planos ativo é público"
    ON plans FOR SELECT
    USING (is_active = true OR is_platform_admin());

CREATE POLICY "Benefícios ativos são públicos para leitura"
    ON benefit_definitions FOR SELECT
    USING (is_active = true OR is_platform_admin());

-- 9. POLÍTICAS PARA ASSINATURAS
CREATE POLICY "Motoristas leem suas assinaturas"
    ON subscriptions FOR SELECT
    USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin());

CREATE POLICY "Oficinas leem sua assinatura B2B"
    ON subscriptions FOR SELECT
    USING (organization_id = get_user_organization_id() OR is_platform_admin());

-- 10. POLÍTICAS PARA RESGATE DE BENEFÍCIOS
CREATE POLICY "Motoristas leem seus resgates"
    ON benefit_redemptions FOR SELECT
    USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()) OR is_platform_admin());

CREATE POLICY "Oficinas gerenciam resgates exclusivos da sua unidade"
    ON benefit_redemptions FOR ALL
    USING (workshop_id = get_user_organization_id() OR is_platform_admin());

-- 11. POLÍTICAS PARA PROMOÇÕES
CREATE POLICY "Motoristas veem apenas promoções aprovadas e ativas"
    ON promotions FOR SELECT
    USING (status = 'active' OR workshop_id = get_user_organization_id() OR is_platform_admin());

CREATE POLICY "Oficinas gerenciam apenas suas próprias promoções"
    ON promotions FOR ALL
    USING (workshop_id = get_user_organization_id() OR is_platform_admin());

-- 12. POLÍTICAS PARA AUDITORIA (ESTRITAMENTE APPEND-ONLY E IMUTÁVEL)
CREATE POLICY "Leitura de auditoria restrita a auditores e donos"
    ON audit_logs FOR SELECT
    USING (is_platform_admin());

-- IMPEDIR QUALQUER DELETE OU UPDATE EM AUDITORIA
CREATE POLICY "Proibido alterar logs de auditoria"
    ON audit_logs FOR UPDATE
    USING (false);

CREATE POLICY "Proibido deletar logs de auditoria"
    ON audit_logs FOR DELETE
    USING (false);
