import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  KeyRound,
  FileText,
  Boxes,
} from 'lucide-react';
import {
  SUPABASE_SQL_SCHEMA,
  AUTH_REGISTER_SQL_SNIPPET,
  AUTH_LOGIN_SQL_SNIPPET,
} from '../data/supabaseSchema';
import {
  syncLocalRecordsToSupabase,
  testSupabaseConnection,
} from '../utils/dataService';
import { getSupabaseStatus } from '../utils/supabaseClient';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: () => void;
  initialError?: string;
}

type SqlTab = 'ALL' | 'AUTH' | 'TAX' | 'LOGIN_REGISTER_QUERIES';

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
  initialError,
}) => {
  const [activeSqlTab, setActiveSqlTab] = useState<SqlTab>('ALL');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'CONNECTED' | 'TABLE_NOT_FOUND' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'NOT_CONFIGURED';
    message: string;
    recordCount: number;
    rawError?: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    syncedCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const status = getSupabaseStatus();

  const handleCopySql = async (textToCopy: string, isAll: boolean = true) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (isAll) {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2500);
      } else {
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setSyncResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.status === 'CONNECTED' && onSyncSuccess) {
        onSyncSuccess();
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLocalRecordsToSupabase();
      setSyncResult(res);
      if (res.success && onSyncSuccess) {
        onSyncSuccess();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const getActiveSqlContent = () => {
    switch (activeSqlTab) {
      case 'AUTH':
        return `-- ==============================================================================
-- CivicTax - Citizen Users & Authentication Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.citizen_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    pan_number TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT '1234',
    aadhaar_number TEXT,
    phone TEXT,
    profession TEXT DEFAULT 'Taxpayer Contributor',
    age INTEGER,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    state TEXT NOT NULL DEFAULT 'Karnataka',
    pincode TEXT DEFAULT '560001',
    filing_count INTEGER DEFAULT 0,
    total_tax_contributed NUMERIC DEFAULT 0,
    data_sharing_consent BOOLEAN DEFAULT TRUE,
    consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    consent_version TEXT DEFAULT 'v1.0-public-growth',
    terms_accepted BOOLEAN DEFAULT TRUE,
    accuracy_declaration BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for citizen_users
CREATE INDEX IF NOT EXISTS idx_citizen_users_email ON public.citizen_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_citizen_users_pan ON public.citizen_users (UPPER(pan_number));
CREATE INDEX IF NOT EXISTS idx_citizen_users_created ON public.citizen_users (created_at DESC);

-- Enable RLS
ALTER TABLE public.citizen_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to citizen_users" ON public.citizen_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to citizen_users" ON public.citizen_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to citizen_users" ON public.citizen_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete to citizen_users" ON public.citizen_users FOR DELETE USING (true);
`;

      case 'LOGIN_REGISTER_QUERIES':
        return `${AUTH_REGISTER_SQL_SNIPPET}

${AUTH_LOGIN_SQL_SNIPPET}`;

      case 'TAX':
        return `-- ==============================================================================
-- CivicTax - Participatory Tax Allocation Records Table
-- ==============================================================================
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

-- Indexes for tax_records
CREATE INDEX IF NOT EXISTS idx_tax_records_user_id ON public.tax_records (user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_email ON public.tax_records (email);
CREATE INDEX IF NOT EXISTS idx_tax_records_pan ON public.tax_records (pan_number);
CREATE INDEX IF NOT EXISTS idx_tax_records_fy ON public.tax_records (financial_year);
CREATE INDEX IF NOT EXISTS idx_tax_records_hash ON public.tax_records (verification_hash);

-- Enable RLS
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tax_records" ON public.tax_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tax_records" ON public.tax_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to tax_records" ON public.tax_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete to tax_records" ON public.tax_records FOR DELETE USING (true);
`;

      case 'ALL':
      default:
        return SUPABASE_SQL_SCHEMA;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" id="supabase-modal-root">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E293B] bg-[#0A0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <span>Supabase Database Schema & Auth Setup</span>
                <span className="text-[11px] font-sans font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  citizen_users & tax_records
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                PostgreSQL tables for citizen authentication, registration, tax ledger allocations, and RLS security policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-2 rounded-xl hover:bg-[#1E293B] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Quick Setup Instructions Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1E293B] text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                  1
                </span>
                <span>Copy Full SQL</span>
              </div>
              <p className="text-[#94A3B8] leading-tight">
                Copies all tables (<code className="text-emerald-400">citizen_users</code>, <code className="text-emerald-400">tax_records</code>), RLS policies, and demo seed data.
              </p>
              <button
                type="button"
                onClick={() => handleCopySql(SUPABASE_SQL_SCHEMA, true)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Full SQL Copied!' : 'Copy All SQL'}</span>
              </button>
            </div>

            <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1E293B] text-sky-400 flex items-center justify-center text-[10px] font-mono">
                  2
                </span>
                <span>Run in SQL Editor</span>
              </div>
              <p className="text-[#94A3B8] leading-tight">
                Open your Supabase project, paste into <strong>SQL Editor &gt; + New Query</strong>, and click <strong>RUN</strong>.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-sky-300 font-semibold flex items-center justify-center gap-1.5 border border-[#334155] transition text-center"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1E293B] text-purple-400 flex items-center justify-center text-[10px] font-mono">
                  3
                </span>
                <span>Verify & Sync</span>
              </div>
              <p className="text-[#94A3B8] leading-tight">
                Click below to test connectivity and sync local tax filings to your cloud database.
              </p>
              <button
                type="button"
                onClick={handleRunSync}
                disabled={isSyncing}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Local Records'}</span>
              </button>
            </div>
          </div>

          {/* Test / Sync Result Banner */}
          {(testResult || syncResult || initialError) && (
            <div className="space-y-2">
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    testResult.status === 'CONNECTED'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}
                >
                  {testResult.status === 'CONNECTED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {testResult.status === 'CONNECTED'
                        ? 'Schema Verified: Connected to Supabase Cloud'
                        : 'Connection Test: Action Needed'}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">{testResult.message}</p>
                    {testResult.rawError && (
                      <div className="font-mono text-[10px] mt-1 bg-black/40 p-1.5 rounded text-red-300">
                        {testResult.rawError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    syncResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {syncResult.success ? 'Sync Successful!' : 'Sync Status'}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">{syncResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SQL Tabs Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveSqlTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeSqlTab === 'ALL'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[#94A3B8] hover:text-white bg-[#0A0B0D]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Full Complete Schema</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSqlTab('AUTH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeSqlTab === 'AUTH'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[#94A3B8] hover:text-white bg-[#0A0B0D]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>citizen_users Table & RLS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSqlTab('LOGIN_REGISTER_QUERIES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeSqlTab === 'LOGIN_REGISTER_QUERIES'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[#94A3B8] hover:text-white bg-[#0A0B0D]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Login & Register SQL Queries</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSqlTab('TAX')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeSqlTab === 'TAX'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[#94A3B8] hover:text-white bg-[#0A0B0D]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>tax_records Ledger</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopySql(getActiveSqlContent(), false)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied Tab SQL!' : 'Copy Active Tab SQL'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{getActiveSqlContent()}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-[#0A0B0D] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL 15+ / Supabase compatible with SHA-256 validation</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-semibold transition border border-[#334155] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
