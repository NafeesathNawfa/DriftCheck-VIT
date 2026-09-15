# DriftCheck Supabase Security & Row Level Security (RLS) Guide

This document details the database schema, security boundaries, and Row Level Security (RLS) policies for DriftCheck on Supabase.

---

## 1. Security Principles

1. **Defense-in-Depth**: Application-level checks are complemented by database-level security policies. Even if an API route had a vulnerability, RLS at the database engine prevents cross-tenant access.
2. **Key Separation**:
   - **Frontend Public Key (`VITE_SUPABASE_ANON_KEY`)**: Safe for distribution in the React client. Permitted only to invoke RLS-protected queries matching the logged-in user session (`auth.uid()`).
   - **Backend Service-Role Key (`SUPABASE_SERVICE_ROLE_KEY`)**: Bypasses RLS. Strictly restricted to backend microservices (FastAPI / workers). **Never committed to Git or exposed to the client bundle.**
3. **Identity Data Separation**: Patient identity records (`identity_vault`) and biomarker measurements (`biomarker_readings`) are logically isolated and linked solely via an opaque `patient_token`.

---

## 2. Architecture & Data Flow

```text
+-----------------------------------------------------------+
| React Client                                              |
| (Uses: VITE_SUPABASE_ANON_KEY + auth.jwt())               |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
| Supabase PostgREST & Auth Engine                          |
| - Evaluates auth.uid() against RLS Policies               |
+-----------------------------+-----------------------------+
                              |
          +-------------------+-------------------+
          |                                       |
          v                                       v
+------------------------+             +------------------------+
| identity_vault         |             | biomarker_readings     |
| (RLS: auth.uid() owner)|             | (RLS: auth.uid() token)|
+------------------------+             +------------------------+
```

---

## 3. Database Schema & RLS Policies (PostgreSQL)

Execute the following DDL migration in the Supabase SQL editor or migration runner:

```sql
-- =============================================================================
-- DriftCheck Supabase Defense-in-Depth Schema & RLS Policies
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table 1: identity_vault
-- Stores mapping between Supabase Auth User ID and the opaque patient_token.
-- Contains sensitive demographic / identity data separated from lab numbers.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.identity_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    patient_token VARCHAR(32) NOT NULL UNIQUE, -- e.g. PAT_7F3A91B2
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance token lookup
CREATE INDEX IF NOT EXISTS idx_identity_vault_user_id ON public.identity_vault(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_identity_vault_patient_token ON public.identity_vault(patient_token);

-- Enable Row Level Security
ALTER TABLE public.identity_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only select their own identity mapping
CREATE POLICY "Users can view their own identity mapping"
    ON public.identity_vault
    FOR SELECT
    USING (auth.uid() = auth_user_id);

-- RLS Policy: Users can update their own identity mapping
CREATE POLICY "Users can update their own identity mapping"
    ON public.identity_vault
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Note: Creation of identity vault records is handled by backend service_role
-- or a trigger on auth.users creation.

-- -----------------------------------------------------------------------------
-- Table 2: biomarker_readings
-- Stores longitudinal laboratory measurements keyed by patient_token.
-- Strictly decoupled from direct personal identifiers (name, DOB, phone).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biomarker_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_token VARCHAR(32) NOT NULL REFERENCES public.identity_vault(patient_token) ON DELETE CASCADE,
    biomarker_id VARCHAR(64) NOT NULL, -- e.g. 'ferritin', 'hemoglobin', 'tsh'
    test_date DATE NOT NULL,
    value NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    reference_low NUMERIC(10, 3),
    reference_high NUMERIC(10, 3),
    lab_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for analytical queries
CREATE INDEX IF NOT EXISTS idx_readings_patient_token ON public.biomarker_readings(patient_token);
CREATE INDEX IF NOT EXISTS idx_readings_token_biomarker ON public.biomarker_readings(patient_token, biomarker_id);
CREATE INDEX IF NOT EXISTS idx_readings_test_date ON public.biomarker_readings(test_date);

-- Enable Row Level Security
ALTER TABLE public.biomarker_readings ENABLE ROW LEVEL SECURITY;

-- Helper function: Retrieve current authenticated user's patient_token
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

-- RLS Policy: Users can only read biomarker records associated with their patient_token
CREATE POLICY "Patients can view their own biomarker readings"
    ON public.biomarker_readings
    FOR SELECT
    USING (
        patient_token = public.get_current_patient_token()
    );

-- RLS Policy: Users can insert biomarker records for their own token
CREATE POLICY "Patients can insert their own biomarker readings"
    ON public.biomarker_readings
    FOR INSERT
    WITH CHECK (
        patient_token = public.get_current_patient_token()
    );

-- RLS Policy: Users can update their own biomarker records
CREATE POLICY "Patients can update their own biomarker readings"
    ON public.biomarker_readings
    FOR UPDATE
    USING (
        patient_token = public.get_current_patient_token()
    )
    WITH CHECK (
        patient_token = public.get_current_patient_token()
    );

-- RLS Policy: Users can delete their own biomarker records
CREATE POLICY "Patients can delete their own biomarker readings"
    ON public.biomarker_readings
    FOR DELETE
    USING (
        patient_token = public.get_current_patient_token()
    );

-- -----------------------------------------------------------------------------
-- Table 3: audit_logs
-- Immutable security event logs. Strictly metadata; no raw PII or lab values.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL, -- e.g. REPORT_UPLOADED, REPORT_PROCESSED
    actor_token VARCHAR(32),
    resource_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    ip_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_token);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Regular users cannot read or write audit logs directly;
-- Only service_role can append and inspect audit logs.
CREATE POLICY "Service role full access to audit logs"
    ON public.audit_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

---

## 4. Environment Configuration

### Frontend (`driftcheck/.env.example`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... # Public anonymous key only
```

### Backend (`backend/.env.example`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # STRICTLY BACKEND ONLY - NEVER COMMIT
PDF_RETENTION_MINUTES=0 # 0 means purge immediately after validation
AI_PROVIDER=openai # or 'anthropic', 'local_vllm'
AI_MODEL_NAME=gpt-4o-mini
```
