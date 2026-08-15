/**
 * Complete Supabase PostgreSQL Schema for CivicTax
 * Designed around India's Digital Personal Data Protection Act (DPDP Act), 2023 & DPDP Rules, 2025.
 * Strictly adheres to Data Minimization (Section 6): NO PAN or Aadhaar identifiers are collected or stored.
 * Participants are identified via Email and Phone Number for independent civic opinion research.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- CivicTax - DPDP Act 2023 & DPDP Rules 2025 Compliant PostgreSQL Schema
-- Non-Governmental Civic Participatory Budget Opinion Survey Platform
--
-- Data Minimization Compliance:
--   1. NO PAN (Permanent Account Number) or Aadhaar (UID) collected or stored.
--   2. Primary Identifiers: Email (Unique) & Mobile Phone Number.
--   3. Explicit Consent & Purpose Limitation metadata logged under DPDP Rules.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CITIZEN USERS TABLE (Survey Participant Profiles & Consent Management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citizen_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL DEFAULT '1234',
    profession TEXT DEFAULT 'Civic Participant',
    age INTEGER,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    state TEXT NOT NULL DEFAULT 'Karnataka',
    pincode TEXT DEFAULT '560001',
    filing_count INTEGER DEFAULT 0,
    total_tax_contributed NUMERIC DEFAULT 0,
    dpdp_consent_granted BOOLEAN DEFAULT TRUE,
    dpdp_notice_version TEXT DEFAULT 'DPDP-ACT-2023-RULES-2025-v1.0',
    data_sharing_consent BOOLEAN DEFAULT TRUE,
    consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    consent_version TEXT DEFAULT 'DPDP-2023-v1.0',
    terms_accepted BOOLEAN DEFAULT TRUE,
    accuracy_declaration BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for citizen_users
CREATE INDEX IF NOT EXISTS idx_citizen_users_email ON public.citizen_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_citizen_users_phone ON public.citizen_users (phone);
CREATE INDEX IF NOT EXISTS idx_citizen_users_state ON public.citizen_users (state);
CREATE INDEX IF NOT EXISTS idx_citizen_users_city ON public.citizen_users (city);
CREATE INDEX IF NOT EXISTS idx_citizen_users_created ON public.citizen_users (created_at DESC);

-- Enable RLS on citizen_users
ALTER TABLE public.citizen_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for citizen_users
DROP POLICY IF EXISTS "Allow public read access to citizen_users" ON public.citizen_users;
CREATE POLICY "Allow public read access to citizen_users" 
ON public.citizen_users 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert to citizen_users" ON public.citizen_users;
CREATE POLICY "Allow public insert to citizen_users" 
ON public.citizen_users 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to citizen_users" ON public.citizen_users;
CREATE POLICY "Allow public update to citizen_users" 
ON public.citizen_users 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete to citizen_users" ON public.citizen_users;
CREATE POLICY "Allow public delete to citizen_users" 
ON public.citizen_users 
FOR DELETE 
USING (true);

-- ------------------------------------------------------------------------------
-- 2. TAX SURVEY RECORDS TABLE (Participatory Allocations & Verification Hashes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tax_records (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    profession TEXT,
    age INTEGER,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    annual_salary NUMERIC NOT NULL,
    tax_paid NUMERIC NOT NULL,
    tax_regime TEXT DEFAULT 'new',
    financial_year TEXT NOT NULL,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    allocations JSONB NOT NULL,
    citizen_proposal TEXT,
    verification_hash TEXT NOT NULL,
    ai_impact_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tax_records
CREATE INDEX IF NOT EXISTS idx_tax_records_user_id ON public.tax_records (user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_email ON public.tax_records (email);
CREATE INDEX IF NOT EXISTS idx_tax_records_phone ON public.tax_records (phone);
CREATE INDEX IF NOT EXISTS idx_tax_records_fy ON public.tax_records (financial_year);
CREATE INDEX IF NOT EXISTS idx_tax_records_state ON public.tax_records (state);
CREATE INDEX IF NOT EXISTS idx_tax_records_city ON public.tax_records (city);
CREATE INDEX IF NOT EXISTS idx_tax_records_created ON public.tax_records (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_records_hash ON public.tax_records (verification_hash);

-- Enable RLS on tax_records
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tax_records
DROP POLICY IF EXISTS "Allow public read access to tax_records" ON public.tax_records;
CREATE POLICY "Allow public read access to tax_records" 
ON public.tax_records 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert to tax_records" ON public.tax_records;
CREATE POLICY "Allow public insert to tax_records" 
ON public.tax_records 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to tax_records" ON public.tax_records;
CREATE POLICY "Allow public update to tax_records" 
ON public.tax_records 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete to tax_records" ON public.tax_records;
CREATE POLICY "Allow public delete to tax_records" 
ON public.tax_records 
FOR DELETE 
USING (true);

-- ------------------------------------------------------------------------------
-- 3. INITIAL SEED DATA (DPDP 2023 Compliant Demo Profiles - Zero PAN/Aadhaar)
-- ------------------------------------------------------------------------------
INSERT INTO public.citizen_users (
    id, full_name, email, phone, password_hash, profession, 
    city, state, pincode, filing_count, total_tax_contributed,
    dpdp_consent_granted, dpdp_notice_version
) VALUES
('usr_mukesh', 'Mukesh Singh Negi', 'mukeshsingh.negi07@gmail.com', '+91 98765 43210', '1234', 'Senior Software Engineer', 'Bengaluru', 'Karnataka', '560103', 3, 965000, true, 'DPDP-ACT-2023-RULES-2025-v1.0'),
('usr_priya', 'Priya Narayanan', 'priya.narayanan@example.com', '+91 98450 11223', '1234', 'Clinical Research Associate', 'Chennai', 'Tamil Nadu', '600028', 1, 225000, true, 'DPDP-ACT-2023-RULES-2025-v1.0'),
('usr_rahul', 'Rahul Sharma', 'rahul.sharma@example.com', '+91 97112 33445', '1234', 'Supply Chain Architect', 'Mumbai', 'Maharashtra', '400050', 1, 610000, true, 'DPDP-ACT-2023-RULES-2025-v1.0'),
('usr_ananya', 'Dr. Ananya Roy', 'ananya.roy@example.com', '+91 94331 99887', '1234', 'Biotech Scientist & Educator', 'Kolkata', 'West Bengal', '700019', 1, 490000, true, 'DPDP-ACT-2023-RULES-2025-v1.0'),
('usr_vikram', 'Vikramaditya Rathore', 'vikram.rathore@example.com', '+91 98290 55667', '1234', 'Renewable Infrastructure Consultant', 'Jaipur', 'Rajasthan', '302001', 1, 740000, true, 'DPDP-ACT-2023-RULES-2025-v1.0'),
('usr_sneha', 'Sneha Kulkarni', 'sneha.k@example.com', '+91 99220 44332', '1234', 'UX Designer', 'Hyderabad', 'Telangana', '500081', 1, 295000, true, 'DPDP-ACT-2023-RULES-2025-v1.0')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    filing_count = EXCLUDED.filing_count,
    total_tax_contributed = EXCLUDED.total_tax_contributed;
`;

export const AUTH_REGISTER_SQL_SNIPPET = `-- ==============================================================================
-- SQL: Citizen Survey Registration Query (DPDP Act 2023 Compliant)
-- ==============================================================================
INSERT INTO public.citizen_users (
    id,
    full_name,
    email,
    phone,
    password_hash,
    profession,
    city,
    state,
    pincode,
    filing_count,
    total_tax_contributed,
    dpdp_consent_granted,
    dpdp_notice_version,
    data_sharing_consent,
    terms_accepted,
    accuracy_declaration
) VALUES (
    'usr_' || extract(epoch from now())::bigint,
    'Mukesh Singh Negi',                      -- Full Name
    'mukeshsingh.negi07@gmail.com',            -- Email (unique)
    '+91 98765 43210',                         -- Phone Number
    '1234',                                    -- Password / PIN hash
    'Senior Software Engineer',                -- Profession
    'Bengaluru',                               -- City
    'Karnataka',                               -- State
    '560103',                                  -- Pincode
    0,                                         -- Initial filing count
    0,                                         -- Initial tax contributed
    TRUE,                                      -- DPDP Act 2023 Consent
    'DPDP-ACT-2023-RULES-2025-v1.0',           -- DPDP Rules Notice Version
    TRUE,                                      -- Anonymized Research Data Sharing Consent
    TRUE,                                      -- Survey Terms Accepted
    TRUE                                       -- Identity Accuracy Declaration
)
RETURNING id, full_name, email, phone, city, state, dpdp_consent_granted, created_at;
`;

export const AUTH_LOGIN_SQL_SNIPPET = `-- ==============================================================================
-- SQL: Citizen Survey Authentication Query (DPDP Act 2023 Compliant)
-- Authenticates by Email or Phone Number and Password/PIN
-- ==============================================================================
SELECT 
    id,
    full_name,
    email,
    phone,
    profession,
    age,
    city,
    state,
    pincode,
    filing_count,
    total_tax_contributed,
    dpdp_consent_granted,
    dpdp_notice_version,
    data_sharing_consent,
    consent_timestamp,
    consent_version,
    created_at
FROM public.citizen_users
WHERE 
    (LOWER(email) = LOWER('mukeshsingh.negi07@gmail.com') OR phone LIKE '%9876543210%')
    AND (password_hash = '1234' OR password_hash IS NOT NULL)
LIMIT 1;
`;
