/**
 * Complete Supabase PostgreSQL Schema for CivicTax
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- CivicTax - Supabase SQL Schema
-- Table: tax_records
-- Description: Stores citizen participatory budget allocations, tax amounts,
--              demographic metadata, proposals, and cryptographic hashes.
-- ==============================================================================

-- 1. Create tax_records table
CREATE TABLE IF NOT EXISTS public.tax_records (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    full_name TEXT NOT NULL,
    pan_number TEXT NOT NULL,
    aadhaar_number TEXT,
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

-- 2. Indexes for efficient querying by financial year, state, user, and creation time
CREATE INDEX IF NOT EXISTS idx_tax_records_user_id ON public.tax_records (user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_email ON public.tax_records (email);
CREATE INDEX IF NOT EXISTS idx_tax_records_pan ON public.tax_records (pan_number);
CREATE INDEX IF NOT EXISTS idx_tax_records_fy ON public.tax_records (financial_year);
CREATE INDEX IF NOT EXISTS idx_tax_records_state ON public.tax_records (state);
CREATE INDEX IF NOT EXISTS idx_tax_records_city ON public.tax_records (city);
CREATE INDEX IF NOT EXISTS idx_tax_records_created ON public.tax_records (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_records_hash ON public.tax_records (verification_hash);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Allow public read access to aggregated civic data & verified certificates
DROP POLICY IF EXISTS "Allow public read access to tax_records" ON public.tax_records;
CREATE POLICY "Allow public read access to tax_records" 
ON public.tax_records 
FOR SELECT 
USING (true);

-- 5. Policies: Allow anonymous and authenticated inserts, updates, and deletes
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

-- 6. Enable Realtime subscriptions (optional for live global ticker updates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'tax_records'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_records;
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Publication supabase_realtime may not exist in some setups, ignore safely
        NULL;
END $$;
`;
