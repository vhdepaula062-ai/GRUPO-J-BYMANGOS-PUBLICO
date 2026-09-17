-- ==============================================================================
-- GRUPO J ECOSYSTEM — MIGRATION: REMOÇÃO COMPLETA DE MOTORISTA (HARD DELETE)
-- Versão: 20260917000001
-- ==============================================================================

CREATE OR REPLACE FUNCTION delete_motorista_completely(
    p_customer_id UUID,
    p_profile_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID := p_profile_id;
    v_sub_ids UUID[];
    v_payment_cust_ids UUID[];
    v_vehicle_ids UUID[];
BEGIN
    -- 1. Se profile_id não foi informado, busca a partir do registro do cliente
    IF v_profile_id IS NULL THEN
        SELECT profile_id INTO v_profile_id FROM customers WHERE id = p_customer_id;
    END IF;

    -- 2. Coleta IDs relacionados antes da remoção
    SELECT COALESCE(ARRAY_AGG(id), '{}') INTO v_sub_ids FROM subscriptions WHERE customer_id = p_customer_id;
    SELECT COALESCE(ARRAY_AGG(id), '{}') INTO v_payment_cust_ids FROM payment_customers WHERE customer_id = p_customer_id;
    SELECT COALESCE(ARRAY_AGG(id), '{}') INTO v_vehicle_ids FROM vehicles WHERE customer_id = p_customer_id;

    -- 3. Exclui dependências financeiras das assinaturas vinculadas
    IF array_length(v_sub_ids, 1) > 0 THEN
        DELETE FROM invoices WHERE subscription_id = ANY(v_sub_ids);
        DELETE FROM payments WHERE subscription_id = ANY(v_sub_ids);
        DELETE FROM discounts WHERE subscription_id = ANY(v_sub_ids);
        DELETE FROM subscription_status_history WHERE subscription_id = ANY(v_sub_ids);
        DELETE FROM subscriptions WHERE id = ANY(v_sub_ids);
    END IF;

    -- 4. Exclui métodos de pagamento e entidades de gateway
    IF array_length(v_payment_cust_ids, 1) > 0 THEN
        DELETE FROM payment_methods WHERE payment_customer_id = ANY(v_payment_cust_ids);
        DELETE FROM payment_customers WHERE id = ANY(v_payment_cust_ids);
    END IF;

    -- 5. Exclui ordens de serviço, agendamentos e resgates de benefícios
    DELETE FROM service_orders 
    WHERE customer_id = p_customer_id 
       OR (array_length(v_vehicle_ids, 1) > 0 AND vehicle_id = ANY(v_vehicle_ids));

    DELETE FROM benefit_redemptions 
    WHERE customer_id = p_customer_id 
       OR (array_length(v_vehicle_ids, 1) > 0 AND vehicle_id = ANY(v_vehicle_ids));
    
    -- Tabela appointments se existir no banco
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        EXECUTE 'DELETE FROM appointments WHERE customer_id = $1 OR (array_length($2, 1) > 0 AND vehicle_id = ANY($2))'
        USING p_customer_id, v_vehicle_ids;
    END IF;

    -- 6. Exclui direitos (entitlements) e ciclos
    DELETE FROM entitlements WHERE customer_id = p_customer_id;
    DELETE FROM entitlement_cycles WHERE customer_id = p_customer_id;

    -- 7. Exclui alocações e histórico de oficinas
    DELETE FROM workshop_assignments WHERE customer_id = p_customer_id;
    DELETE FROM workshop_assignment_history WHERE customer_id = p_customer_id;

    -- 8. Exclui histórico de posse de veículos e os próprios veículos
    DELETE FROM vehicle_ownership_history 
    WHERE new_customer_id = p_customer_id 
       OR previous_customer_id = p_customer_id 
       OR (array_length(v_vehicle_ids, 1) > 0 AND vehicle_id = ANY(v_vehicle_ids));

    DELETE FROM vehicles WHERE customer_id = p_customer_id;

    -- 9. Exclui contatos e endereços do cliente
    DELETE FROM customer_contacts WHERE customer_id = p_customer_id;
    DELETE FROM customer_addresses WHERE customer_id = p_customer_id;

    -- 10. Exclui o cadastro principal de cliente
    DELETE FROM customers WHERE id = p_customer_id;

    -- 11. Se houver profile associado, desvincula auditoria e exclui o perfil
    IF v_profile_id IS NOT NULL THEN
        DELETE FROM account_erasure_requests WHERE user_id = v_profile_id;
        DELETE FROM sessions_metadata WHERE user_id = v_profile_id;
        DELETE FROM user_roles WHERE user_id = v_profile_id;
        
        -- Atualiza logs de auditoria para anônimo para manter histórico auditável sem quebrar integridade
        UPDATE audit_logs SET actor_user_id = NULL WHERE actor_user_id = v_profile_id;
        
        DELETE FROM profiles WHERE id = v_profile_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'customer_id', p_customer_id,
        'profile_id', v_profile_id
    );
END;
$$;
