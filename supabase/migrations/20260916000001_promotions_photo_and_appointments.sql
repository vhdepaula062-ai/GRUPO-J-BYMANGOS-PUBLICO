-- Adiciona suporte a imagem nas promoções e suporte a agendamentos flexíveis

ALTER TABLE IF EXISTS promotions
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Tabela de agendamentos operacionais flexíveis
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    benefit_id UUID REFERENCES benefit_definitions(id) ON DELETE SET NULL,
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(30),
    vehicle_info VARCHAR(100),
    service_type VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    shift VARCHAR(20) NOT NULL DEFAULT 'morning' CHECK (shift IN ('morning', 'afternoon', 'flexible', 'custom')),
    scheduled_time TIME,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_workshop_date ON appointments(workshop_id, appointment_date);

-- Habilitar RLS para agendamentos
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oficinas podem gerenciar seus agendamentos" ON public.appointments
FOR ALL TO authenticated
USING (public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
 WHERE m.user_id=auth.uid() AND m.organization_id=appointments.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')))
WITH CHECK (public.is_platform_admin() OR EXISTS(SELECT 1 FROM public.organization_members m JOIN public.organizations o ON o.id=m.organization_id
 WHERE m.user_id=auth.uid() AND m.organization_id=appointments.workshop_id AND m.is_active AND o.status='active' AND m.role IN ('owner','manager','attendant')));
