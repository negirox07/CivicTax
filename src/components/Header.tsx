import React from 'react';
import {
  Landmark,
  FileText,
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Sparkles,
  Globe2,
  Cloud,
  HardDrive,
} from 'lucide-react';
import { TaxRecord } from '../types';
import { formatCompactINR, getTaxpayerTier } from '../utils/formatters';

export type AppNavTab = 'global' | 'filing' | 'dashboard' | 'reports' | 'transparency';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  records: TaxRecord[];
  onResetData: () => void;
  onNewFiling: () => void;
  dataSource?: 'SUPABASE' | 'LOCAL_STORAGE';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  records,
  onResetData,
  onNewFiling,
  dataSource = 'LOCAL_STORAGE',
}) => {
  const totalTaxAllYears = records.reduce((acc, r) => acc + (Number(r.taxPaid) || 0), 0);
  const taxpayerTier = getTaxpayerTier(totalTaxAllYears);
  const latestRecord = records[0];

  return (
    <header className="bg-[#0F172A] border-b border-[#1E293B] text-[#E2E8F0] sticky top-0 z-40 shadow-lg" id="app-header-nav">
      {/* Top Notification / Transparency Banner */}
      <div className="bg-[#0A0B0D] px-4 py-1.5 text-xs text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[#E2E8F0]">National Citizen Tax Allocation & Public Governance Initiative</span>
          <span className="hidden md:inline text-[#64748B]">• Directing citizen tax capital into verified public growth</span>
        </div>
        <div className="flex items-center gap-3 text-[#94A3B8] text-xs">
          <span
            className={`hidden sm:inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border ${
              dataSource === 'SUPABASE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
            }`}
          >
            {dataSource === 'SUPABASE' ? <Cloud className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
            <span>DB: {dataSource === 'SUPABASE' ? 'Supabase Cloud' : 'Local Mock'}</span>
          </span>

          {latestRecord && (
            <span className="hidden sm:inline bg-[#1E293B] border border-[#334155] px-2 py-0.5 rounded text-[#E2E8F0]">
              Taxpayer: <strong className="text-white">{latestRecord.fullName}</strong>
            </span>
          )}
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Masked Privacy
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('global')}
            title="Go to National Public Dashboard Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Landmark className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-serif">CivicTax</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Public Ledger
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] hidden sm:block">
                Citizen Budget Allocation & Public Interest Intelligence
              </p>
            </div>
          </div>

          {/* User Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 bg-[#1E293B] border border-[#334155] rounded-xl px-3.5 py-1.5 text-xs">
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Total Tax Tracked</span>
              <span className="text-emerald-400 font-bold text-sm font-mono">{formatCompactINR(totalTaxAllYears)}</span>
            </div>
            <div className="h-6 w-px bg-[#334155]"></div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Filings</span>
              <span className="text-[#E2E8F0] font-bold text-sm">{records.length} Years</span>
            </div>
            <div className="h-6 w-px bg-[#334155]"></div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Civic Tier</span>
              <span className="text-amber-400 font-semibold">{taxpayerTier.tierName.split(' ')[0]}</span>
            </div>
          </div>

          {/* Action Buttons & Reset */}
          <div className="flex items-center gap-2">
            <button
              id="header-file-new-year-btn"
              onClick={onNewFiling}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File New Tax</span>
            </button>

            <button
              id="header-reset-demo-data-btn"
              onClick={onResetData}
              title="Reset to pre-loaded sample multi-year tax records"
              className="p-2 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] rounded-lg transition text-xs flex items-center gap-1 border border-[#1E293B] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Demo Data</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-[#1E293B] overflow-x-auto scrollbar-none">
          <button
            id="nav-tab-global-btn"
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'global'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Public Global Dashboard</span>
          </button>

          <button
            id="nav-tab-filing-btn"
            onClick={() => setActiveTab('filing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'filing'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>File & Allocate</span>
          </button>

          <button
            id="nav-tab-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>My Filings</span>
            {records.length > 0 && (
              <span className="bg-[#1E293B] text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                {records.length}
              </span>
            )}
          </button>

          <button
            id="nav-tab-reports-btn"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>PDF Reports</span>
          </button>

          <button
            id="nav-tab-transparency-btn"
            onClick={() => setActiveTab('transparency')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'transparency'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fiscal Consensus Matrix</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

