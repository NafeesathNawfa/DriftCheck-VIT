-- =============================================================================
-- DriftCheck Supabase Defense-in-Depth Schema & RLS Policies
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Identity Vault (Logical Isolation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.identity_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    patient_token VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_vault_user_id ON public.identity_vault(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_identity_vault_patient_token ON public.identity_vault(patient_token);

ALTER TABLE public.identity_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own identity mapping"
    ON public.identity_vault
    FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own identity mapping"
    ON public.identity_vault
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- -----------------------------------------------------------------------------
-- 2. Biomarker Readings (Tokenized Lab Data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biomarker_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_token VARCHAR(32) NOT NULL REFERENCES public.identity_vault(patient_token) ON DELETE CASCADE,
    biomarker_id VARCHAR(64) NOT NULL,
    test_date DATE NOT NULL,
    value NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    reference_low NUMERIC(10, 3),
    reference_high NUMERIC(10, 3),
    lab_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_patient_token ON public.biomarker_readings(patient_token);
CREATE INDEX IF NOT EXISTS idx_readings_token_biomarker ON public.biomarker_readings(patient_token, biomarker_id);
CREATE INDEX IF NOT EXISTS idx_readings_test_date ON public.biomarker_readings(test_date);

ALTER TABLE public.biomarker_readings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_patient_token()
RETURNS VARCHAR(32)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT patient_token
    FROM public.identity_vault
    WHERE auth_user_id = auth.uid()
    LIMIT 1;
$$;

CREATE POLICY "Patients can view their own biomarker readings"
    ON public.biomarker_readings
    FOR SELECT
    USING (patient_token = public.get_current_patient_token());

CREATE POLICY "Patients can insert their own biomarker readings"
    ON public.biomarker_readings
    FOR INSERT
    WITH CHECK (patient_token = public.get_current_patient_token());

CREATE POLICY "Patients can update their own biomarker readings"
    ON public.biomarker_readings
    FOR UPDATE
    USING (patient_token = public.get_current_patient_token())
    WITH CHECK (patient_token = public.get_current_patient_token());

CREATE POLICY "Patients can delete their own biomarker readings"
    ON public.biomarker_readings
    FOR DELETE
    USING (patient_token = public.get_current_patient_token());

-- -----------------------------------------------------------------------------
-- 3. Security Audit Logs (Append-only by backend service_role)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    actor_token VARCHAR(32),
    resource_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    ip_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_token);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to audit logs"
    ON public.audit_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
