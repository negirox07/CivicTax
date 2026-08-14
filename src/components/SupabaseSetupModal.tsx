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
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSchema';
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

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
  initialError,
}) => {
  const [copied, setCopied] = useState(false);
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

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E293B] bg-[#0A0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <span>Supabase Database Schema Setup</span>
                <span className="text-[11px] font-sans font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  public.tax_records
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Fix "table 'public.tax_records' not found in schema cache" by initializing the SQL schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-2 rounded-xl hover:bg-[#1E293B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Explanation Alert */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-200 text-sm">
                Why am I seeing "Could not find the table 'public.tax_records'"?
              </div>
              <p className="text-amber-300/80 leading-relaxed">
                Your Supabase connection credentials (<code className="font-mono bg-amber-900/40 px-1 py-0.5 rounded text-amber-200">VITE_SUPABASE_URL</code>) are detected, but your Supabase PostgreSQL database is fresh and does not yet contain the <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">public.tax_records</code> table.
              </p>
              <p className="text-amber-300/80 leading-relaxed">
                Follow the 3 quick steps below to copy and execute the SQL migration script in your Supabase SQL Editor.
              </p>
            </div>
          </div>

          {/* 3 Step Action Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">
                1
              </span>
              <span>Quick 3-Step Setup Instructions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#1E293B] text-emerald-400 flex items-center justify-center text-[10px] font-mono">
                    Step 1
                  </span>
                  <span>Copy SQL</span>
                </div>
                <p className="text-[#94A3B8] leading-tight">
                  Click the button below to copy the complete idempotent SQL script for creating <code className="text-emerald-400">tax_records</code> with RLS policies.
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'SQL Copied!' : 'Copy SQL Schema Script'}</span>
                </button>
              </div>

              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#1E293B] text-sky-400 flex items-center justify-center text-[10px] font-mono">
                    Step 2
                  </span>
                  <span>Run in Supabase</span>
                </div>
                <p className="text-[#94A3B8] leading-tight">
                  Open your Supabase project dashboard, navigate to <strong>SQL Editor</strong> &gt; <strong>+ New Query</strong>, paste the script, and click <strong>RUN</strong>.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-sky-300 font-semibold flex items-center justify-center gap-1.5 border border-[#334155] transition text-center"
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#1E293B] text-purple-400 flex items-center justify-center text-[10px] font-mono">
                    Step 3
                  </span>
                  <span>Verify & Sync</span>
                </div>
                <p className="text-[#94A3B8] leading-tight">
                  Once executed in Supabase, click <strong>"Test & Sync Records"</strong> below to populate the database and activate live cloud sync.
                </p>
                <button
                  type="button"
                  onClick={handleRunSync}
                  disabled={isSyncing}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Local to Supabase'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test or Sync Result Feedback */}
          {(testResult || syncResult || initialError) && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300">Connection & Sync Diagnostics</h4>

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
                        ? 'Schema Verified: Connected to Supabase'
                        : 'Connection Test: Action Needed'}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">{testResult.message}</p>
                    {testResult.rawError && (
                      <div className="font-mono text-[10px] mt-1 bg-black/40 p-1.5 rounded text-red-300">
                        Error: {testResult.rawError}
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
                      {syncResult.success ? 'Sync Successful!' : 'Sync Failed'}
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">{syncResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SQL Code Preview Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>SQL Schema Definition (supabase_schema.sql)</span>
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy All SQL'}</span>
              </button>
            </div>

            <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-6 bg-[#0A0B0D] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Includes Row Level Security (RLS) and Realtime Publication</span>
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
