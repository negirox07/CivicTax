import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  Building2,
  HeartPulse,
  GraduationCap,
  Leaf,
  Tractor,
  Atom,
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Database,
  Cloud,
  HardDrive,
  RefreshCw,
  Sliders,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  MessageSquare,
  ChevronRight,
  FileCheck2,
  Info,
  HelpCircle,
  Scale,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TaxRecord, SectorId, CitizenUser } from '../types';
import { SECTOR_DEFINITIONS } from '../data/sectors';
import { formatCurrencyINR, formatCompactINR } from '../utils/formatters';
import {
  calculateGlobalPublicStats,
  GlobalPublicStats,
  SectorConsensusItem,
  syncLocalRecordsToSupabase,
} from '../utils/dataService';
import {
  isSupabaseActive,
  isSupabaseConfigured,
  setSupabaseActiveFlag,
  getSupabaseStatus,
} from '../utils/supabaseClient';

interface GlobalDashboardViewProps {
  records: TaxRecord[];
  currentUser?: CitizenUser | null;
  userRecordCount?: number;
  onOpenAuthModal?: () => void;
  onStartFiling: () => void;
  onGoToPersonalDashboard: () => void;
  onGoToReports: () => void;
  onOpenSupabaseModal?: () => void;
  dataSource: 'SUPABASE' | 'LOCAL_STORAGE';
  onReloadData: () => void;
}

export const GlobalDashboardView: React.FC<GlobalDashboardViewProps> = ({
  records,
  currentUser = null,
  userRecordCount = 0,
  onOpenAuthModal,
  onStartFiling,
  onGoToPersonalDashboard,
  onGoToReports,
  onOpenSupabaseModal,
  dataSource,
  onReloadData,
}) => {
  const [selectedFY, setSelectedFY] = useState<string>('ALL');
  const [selectedViewTab, setSelectedViewTab] = useState<'consensus' | 'sectors' | 'states' | 'proposals'>('consensus');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    message: string;
    isError: boolean;
    tableNotFound?: boolean;
  } | null>(null);

  // Supabase cloud integration status
  const supabaseActive = isSupabaseActive();
  const supabaseConfigured = isSupabaseConfigured();

  // Active hovered sector in Donut Chart
  const [activeDonutSectorId, setActiveDonutSectorId] = useState<SectorId | null>(null);

  // Sector comparison selection (e.g. Education vs Healthcare)
  const [compareSectorA, setCompareSectorA] = useState<SectorId>('education');
  const [compareSectorB, setCompareSectorB] = useState<SectorId>('healthcare');

  // Check if current user is admin (mukeshsingh.negi07@gmail.com)
  const isAdmin = currentUser?.email?.trim().toLowerCase() === 'mukeshsingh.negi07@gmail.com';

  // Compute aggregated public interest statistics
  const stats: GlobalPublicStats = useMemo(() => {
    return calculateGlobalPublicStats(records, selectedFY);
  }, [records, selectedFY]);

  // Aggregate Donut Chart dataset sorted by citizen allocation volume
  const aggregateDonutData = useMemo(() => {
    return stats.sectorConsensus.map((sec) => ({
      name: sec.name,
      shortName: sec.shortName,
      sectorId: sec.sectorId,
      value: sec.citizenAvgPct,
      amount: sec.totalAllocatedAmount,
      color: sec.chartColor,
      iconName: sec.iconName,
      govBenchmarkPct: sec.govBenchmarkPct,
      deltaPct: sec.deltaPct,
      contributorsCount: sec.contributorsCount,
    })).sort((a, b) => b.value - a.value);
  }, [stats.sectorConsensus]);

  const activeDonutItem = useMemo(() => {
    if (!activeDonutSectorId) return null;
    return aggregateDonutData.find((d) => d.sectorId === activeDonutSectorId) || null;
  }, [activeDonutSectorId, aggregateDonutData]);

  // Pairwise comparison stats
  const sectorAStats = useMemo(() => {
    return stats.sectorConsensus.find((s) => s.sectorId === compareSectorA) || stats.sectorConsensus[0];
  }, [stats.sectorConsensus, compareSectorA]);

  const sectorBStats = useMemo(() => {
    return stats.sectorConsensus.find((s) => s.sectorId === compareSectorB) || stats.sectorConsensus[1];
  }, [stats.sectorConsensus, compareSectorB]);

  // Handle manual Supabase sync
  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncLocalRecordsToSupabase();
      setSyncStatus({
        message: result.message,
        isError: !result.success,
        tableNotFound: result.tableNotFound,
      });
      if (result.success) {
        onReloadData();
        setTimeout(() => setSyncStatus(null), 5000);
      }
    } catch (err: any) {
      setSyncStatus({
        message: err.message || 'Failed to sync to Supabase',
        isError: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle runtime flag for testing
  const handleToggleSupabaseMode = (enable: boolean) => {
    setSupabaseActiveFlag(enable);
    onReloadData();
  };

  const renderSectorIcon = (iconName: string, iconClass: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'GraduationCap':
        return <GraduationCap className={iconClass} />;
      case 'HeartPulse':
        return <HeartPulse className={iconClass} />;
      case 'Leaf':
        return <Leaf className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Tractor':
        return <Tractor className={iconClass} />;
      case 'Atom':
        return <Atom className={iconClass} />;
      case 'Users':
        return <Users className={iconClass} />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="global-dashboard-root">
      {/* Hero Landing Banner */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#131E32] to-[#0A0B0D] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />
                <span>National Public Interest & Tax Transparency Ledger</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight leading-tight">
                Where Citizens Want Their Taxes Spent
              </h1>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                Explore real-time participatory budgeting data from verified citizen taxpayers across India.
                Discover which development sectors citizens prioritize over statutory government allocations,
                and track the collective civic assets built.
              </p>
            </div>

            {/* Quick Action CTAs & Citizen Status */}
            <div className="flex flex-col gap-3 shrink-0 lg:w-72">
              {currentUser ? (
                <div className="bg-[#0A0B0D]/90 border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Signed In Citizen
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      DPDP Verified
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                  <div className="text-[11px] text-[#94A3B8]">{userRecordCount} personal returns tracked</div>

                  <button
                    id="landing-hero-view-my-filings-btn"
                    type="button"
                    onClick={onGoToPersonalDashboard}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Open My Private Filings ({userRecordCount})</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#0A0B0D]/90 border border-[#1E293B] rounded-2xl p-4 space-y-2 shadow-lg">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Citizen Taxpayer Access</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-tight">
                    Sign in to track your personal tax history & download verifiable civic impact certificates.
                  </p>
                  {onOpenAuthModal && (
                    <button
                      id="landing-hero-signin-btn"
                      type="button"
                      onClick={onOpenAuthModal}
                      className="w-full mt-1 py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-emerald-400 font-bold text-xs border border-emerald-500/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Citizen Sign In / Quick Demo</span>
                    </button>
                  )}
                </div>
              )}

              <button
                id="landing-hero-file-tax-btn"
                type="button"
                onClick={onStartFiling}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>File & Direct Budget</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-[#1E293B]">
            <div className="bg-[#0A0B0D]/80 border border-[#1E293B] p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Total Citizen Taxes Tracked
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrencyINR(stats.totalTaxesPaid)}
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                From {stats.totalCitizens} verified citizen filings
              </span>
            </div>

            <div className="bg-[#0A0B0D]/80 border border-[#1E293B] p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Top Citizen Priority Sector
              </span>
              <div className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: stats.topRankedSectors[0]?.chartColor || '#10b981' }}
                ></span>
                <span className="truncate">{stats.topRankedSectors[0]?.shortName || 'Healthcare'}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                {stats.topRankedSectors[0]?.citizenAvgPct}% public consensus
              </span>
            </div>

            <div className="bg-[#0A0B0D]/80 border border-[#1E293B] p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Avg Tax Per Contributor
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-sky-400 mt-1">
                {formatCompactINR(stats.averageTaxPerCitizen)}
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                Across {stats.activeStatesCount} states & {stats.activeCitiesCount} cities
              </span>
            </div>

            <div className="bg-[#0A0B0D]/80 border border-[#1E293B] p-4 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Citizen Proposals Logged
              </span>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
                {stats.recentCitizenProposals.length} Proposals
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                Active participatory feedback
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Supabase & Storage Status Indicator Banner (ADMIN ONLY: mukeshsingh.negi07@gmail.com) */}
      {isAdmin && (
        <>
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center ${
                  dataSource === 'SUPABASE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}
              >
                {dataSource === 'SUPABASE' ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0]">
                    Admin Storage Engine:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                      dataSource === 'SUPABASE'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {dataSource === 'SUPABASE' ? 'SUPABASE CLOUD DATABASE' : 'LOCAL LEDGER (OFFLINE MOCK)'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {dataSource === 'SUPABASE'
                    ? 'Direct production database connectivity active. All citizen filings are persisted to Supabase.'
                    : 'Single-flag architecture ready: toggle `VITE_USE_SUPABASE="true"` in `.env` to connect directly to Supabase cloud.'}
                </p>
              </div>
            </div>

            {/* Supabase Controls */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
              {onOpenSupabaseModal && (
                <button
                  id="open-supabase-setup-modal-btn"
                  type="button"
                  onClick={onOpenSupabaseModal}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition active:scale-95 cursor-pointer"
                  title="View Supabase table schema and 1-click SQL migration"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>SQL Schema & Setup</span>
                </button>
              )}

              {supabaseConfigured && (
                <button
                  id="sync-to-supabase-btn"
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] px-3.5 py-2 rounded-xl border border-[#334155] transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Push local data to Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync to Cloud'}</span>
                </button>
              )}

              <button
                id="toggle-storage-mode-btn"
                type="button"
                onClick={() => handleToggleSupabaseMode(!supabaseActive)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                  supabaseActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Mode: {supabaseActive ? 'Cloud Active' : 'Local Mock'}</span>
              </button>
            </div>
          </div>

          {/* Sync Status Alert Banner */}
          {syncStatus && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                syncStatus.isError
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {syncStatus.isError ? (
                  <HelpCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {syncStatus.tableNotFound
                      ? "Supabase Table 'public.tax_records' Not Created Yet"
                      : syncStatus.isError
                      ? 'Supabase Sync Notice'
                      : 'Sync Successful'}
                  </div>
                  <p className="opacity-90 mt-0.5">{syncStatus.message}</p>
                </div>
              </div>

              {syncStatus.tableNotFound && onOpenSupabaseModal && (
                <button
                  type="button"
                  onClick={onOpenSupabaseModal}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Setup Table (1-Click SQL)
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Global Filter Bar & View Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            id="tab-view-consensus-btn"
            type="button"
            onClick={() => setSelectedViewTab('consensus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedViewTab === 'consensus'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Areas of Interest & Consensus</span>
          </button>

          <button
            id="tab-view-sectors-btn"
            type="button"
            onClick={() => setSelectedViewTab('sectors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedViewTab === 'sectors'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Sector Breakdown ({stats.topRankedSectors.length})</span>
          </button>

          <button
            id="tab-view-states-btn"
            type="button"
            onClick={() => setSelectedViewTab('states')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedViewTab === 'states'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>3. State & Metro Participation</span>
          </button>

          <button
            id="tab-view-proposals-btn"
            type="button"
            onClick={() => setSelectedViewTab('proposals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedViewTab === 'proposals'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>4. Citizen Proposals ({stats.recentCitizenProposals.length})</span>
          </button>
        </div>

        {/* Financial Year Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="w-4 h-4 text-[#64748B]" />
          <span className="text-xs text-[#94A3B8] font-semibold">Fiscal Cycle:</span>
          <select
            id="global-fy-selector"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="bg-[#0F172A] border border-[#1E293B] text-[#E2E8F0] text-xs font-bold rounded-xl px-3 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Financial Years</option>
            {stats.financialYears.map((fy) => (
              <option key={fy} value={fy}>
                FY {fy}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: CITIZEN CONSENSUS & AREAS OF TOP INTEREST */}
      {selectedViewTab === 'consensus' && (
        <div className="space-y-8">
          {/* RECHARTS DONUT CHART: AGGREGATE CITIZEN-DEFINED BUDGET PRIORITIES */}
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <PieIcon className="w-4 h-4" />
                  <span>Aggregate Citizen Budget Priorities</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  National Citizen Budget Priorities (Donut Distribution)
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
                  Interactive Recharts donut visualization of aggregate citizen tax allocations across all 8 development sectors. Compare priority shares (such as Education vs. Healthcare) and inspect total public capital volume.
                </p>
              </div>

              {/* Quick Pairwise Comparative Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#94A3B8] font-semibold">Priority Focus:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCompareSectorA('education');
                    setCompareSectorB('healthcare');
                    setActiveDonutSectorId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    compareSectorA === 'education' && compareSectorB === 'healthcare'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Education</span>
                  <span className="text-[#64748B] text-[10px]">vs</span>
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span>Healthcare</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompareSectorA('clean_energy');
                    setCompareSectorB('infrastructure');
                    setActiveDonutSectorId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    compareSectorA === 'clean_energy' && compareSectorB === 'infrastructure'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clean Energy</span>
                  <span className="text-[#64748B] text-[10px]">vs</span>
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Infrastructure</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompareSectorA('agriculture');
                    setCompareSectorB('science_tech');
                    setActiveDonutSectorId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    compareSectorA === 'agriculture' && compareSectorB === 'science_tech'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                  }`}
                >
                  <Tractor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agriculture</span>
                  <span className="text-[#64748B] text-[10px]">vs</span>
                  <Atom className="w-3.5 h-3.5 text-purple-400" />
                  <span>Science & Tech</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart Display */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative bg-[#0A0B0D]/70 rounded-2xl p-6 border border-[#1E293B]">
                <div className="w-full h-72 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregateDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={108}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveDonutSectorId(aggregateDonutData[index]?.sectorId || null)}
                        onMouseLeave={() => setActiveDonutSectorId(null)}
                        cursor="pointer"
                      >
                        {aggregateDonutData.map((entry) => (
                          <Cell
                            key={`donut-cell-${entry.sectorId}`}
                            fill={entry.color}
                            stroke={activeDonutSectorId === entry.sectorId ? '#FFFFFF' : '#0F172A'}
                            strokeWidth={activeDonutSectorId === entry.sectorId ? 2.5 : 1}
                            opacity={activeDonutSectorId === null || activeDonutSectorId === entry.sectorId ? 1 : 0.65}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val}% (${formatCurrencyINR(item.payload.amount)})`,
                          item.payload.name,
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          backgroundColor: '#0A0B0D',
                          borderColor: '#1E293B',
                          color: '#E2E8F0',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Donut Label Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    {activeDonutItem ? (
                      <>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider line-clamp-1 max-w-[130px]">
                          {activeDonutItem.shortName}
                        </span>
                        <span className="text-2xl font-black font-mono text-emerald-400 my-0.5">
                          {activeDonutItem.value}%
                        </span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">
                          {formatCompactINR(activeDonutItem.amount)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                          Consensus Total
                        </span>
                        <span className="text-2xl font-black font-mono text-white my-0.5">
                          100%
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          8 Priority Sectors
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[#94A3B8] text-center mt-2 flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Hover or tap donut wedges to isolate specific sector metrics</span>
                </div>
              </div>

              {/* Priority Analysis & Head-to-Head Comparison */}
              <div className="lg:col-span-7 space-y-4">
                {/* Dynamic Head-to-Head Comparison Card (e.g., Education vs. Healthcare) */}
                <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Priority Comparison: {sectorAStats?.shortName} vs {sectorBStats?.shortName}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#1E293B] text-emerald-300 border border-emerald-500/20">
                      {Math.abs(Number(((sectorAStats?.citizenAvgPct || 0) - (sectorBStats?.citizenAvgPct || 0)).toFixed(1)))}% Citizen Preference Margin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => {
                        setActiveDonutSectorId(activeDonutSectorId === sectorAStats?.sectorId ? null : sectorAStats?.sectorId || null);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        activeDonutSectorId === sectorAStats?.sectorId
                          ? 'bg-[#131E32] border-emerald-500 shadow-md'
                          : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sectorAStats?.chartColor }}></span>
                          <span className="truncate">{sectorAStats?.shortName}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {sectorAStats?.citizenAvgPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        Capital: {formatCompactINR(sectorAStats?.totalAllocatedAmount || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Govt: {sectorAStats?.govBenchmarkPct}%</span>
                        <span className={sectorAStats?.deltaPct > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {sectorAStats?.deltaPct > 0 ? `+${sectorAStats?.deltaPct}% Demand` : `${sectorAStats?.deltaPct}%`}
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveDonutSectorId(activeDonutSectorId === sectorBStats?.sectorId ? null : sectorBStats?.sectorId || null);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        activeDonutSectorId === sectorBStats?.sectorId
                          ? 'bg-[#131E32] border-emerald-500 shadow-md'
                          : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sectorBStats?.chartColor }}></span>
                          <span className="truncate">{sectorBStats?.shortName}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {sectorBStats?.citizenAvgPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        Capital: {formatCompactINR(sectorBStats?.totalAllocatedAmount || 0)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Govt: {sectorBStats?.govBenchmarkPct}%</span>
                        <span className={sectorBStats?.deltaPct > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {sectorBStats?.deltaPct > 0 ? `+${sectorBStats?.deltaPct}% Demand` : `${sectorBStats?.deltaPct}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8-Sector Donut Legend & Allocation Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {aggregateDonutData.map((item, idx) => {
                    const isSelected = activeDonutSectorId === item.sectorId;
                    return (
                      <div
                        key={item.sectorId}
                        onMouseEnter={() => setActiveDonutSectorId(item.sectorId)}
                        onMouseLeave={() => setActiveDonutSectorId(null)}
                        onClick={() => setActiveDonutSectorId(isSelected ? null : item.sectorId)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#131E32] border-emerald-500 scale-[1.02] shadow-md shadow-emerald-500/10'
                            : 'bg-[#0A0B0D] border-[#1E293B] hover:border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                            <span className="truncate">{item.shortName}</span>
                          </span>
                          <span className="text-[10px] font-bold font-mono text-[#64748B]">#{idx + 1}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-mono font-black text-emerald-400">{item.value}%</span>
                          <span className="text-[10px] font-mono text-[#94A3B8]">{formatCompactINR(item.amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Comparison Chart: Citizen Consensus Demand vs Statutory Union Budget */}
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Participatory Budgeting Matrix</span>
                </div>
                <h2 className="text-xl font-bold font-serif text-white">
                  Where Citizens Want to Direct Tax Money
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Average citizen allocation preference across 8 key development sectors vs statutory Central Union Budget benchmark
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Citizen Preference Consensus (%)
                </span>
                <span className="flex items-center gap-1.5 text-[#94A3B8]">
                  <span className="w-3 h-3 rounded-xs bg-[#475569]"></span> Union Govt Baseline (%)
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sectorConsensus} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: '#1E293B' }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={{ stroke: '#1E293B' }}
                  />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [
                      `${val}%`,
                      name === 'citizenAvgPct' ? 'Citizen Average Consensus' : 'Govt Union Budget Baseline',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#0A0B0D',
                      borderColor: '#1E293B',
                      color: '#E2E8F0',
                    }}
                  />
                  <Bar dataKey="citizenAvgPct" name="Citizen Consensus" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="govBenchmarkPct" name="Govt Budget" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Ranked Insights List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#1E293B]">
              {stats.topRankedSectors.slice(0, 4).map((sec, idx) => (
                <div
                  key={sec.sectorId}
                  className="bg-[#0A0B0D] border border-[#1E293B] p-3.5 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#1E293B] text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-[#E2E8F0]">{sec.shortName}</div>
                      <div className="text-[10px] text-[#94A3B8]">
                        Capital: {formatCompactINR(sec.totalAllocatedAmount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">{sec.citizenAvgPct}%</div>
                    <div
                      className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${
                        sec.deltaPct > 0 ? 'text-emerald-400' : sec.deltaPct < 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {sec.deltaPct > 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3" /> +{sec.deltaPct}%
                        </>
                      ) : sec.deltaPct < 0 ? (
                        <>
                          <ArrowDownRight className="w-3 h-3" /> {sec.deltaPct}%
                        </>
                      ) : (
                        'Aligned'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* National Tangible Civic Outputs Tally */}
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B]/60 to-[#0A0B0D] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Tangible Public Infrastructure Deliverables</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Collective Physical Assets Funded by Citizens
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Aggregated infrastructure, health diagnostic panels, and solar mini-grids made possible by citizen contributions
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                Total Tax: {formatCurrencyINR(stats.totalTaxesPaid)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sky-400 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Paved Roadways</span>
                </div>
                <div className="text-xl font-bold font-mono text-[#E2E8F0]">
                  {stats.tangibleOutcomes.roadMeters.toLocaleString()} Meters
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  High-durability bitumen surface with drainage
                </p>
              </div>

              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <HeartPulse className="w-4 h-4" />
                  <span className="text-xs font-bold">Clinical Diagnostics</span>
                </div>
                <div className="text-xl font-bold font-mono text-[#E2E8F0]">
                  {stats.tangibleOutcomes.hospitalDiagnostics.toLocaleString()} Panels
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Free pathology & imaging tests for low-income families
                </p>
              </div>

              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Leaf className="w-4 h-4" />
                  <span className="text-xs font-bold">Solar Rooftop Power</span>
                </div>
                <div className="text-xl font-bold font-mono text-[#E2E8F0]">
                  {stats.tangibleOutcomes.solarPanelsKwh.toLocaleString()} kWh
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Mitigating ~{stats.tangibleOutcomes.co2TonsMitigated} tons of CO2
                </p>
              </div>

              <div className="bg-[#0A0B0D] border border-[#1E293B] p-4 rounded-xl">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-bold">STEM Scholarships</span>
                </div>
                <div className="text-xl font-bold font-mono text-[#E2E8F0]">
                  {stats.tangibleOutcomes.studentScholarships.toLocaleString()} Students
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Full-year tuition kits and digital learning tablets
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL SECTORAL BREAKDOWN & FISCAL DELTAS */}
      {selectedViewTab === 'sectors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-[#94A3B8]">
            <span>Ranked by Citizen Allocation Volume (Top Areas of Citizen Interest):</span>
            <span>
              Contributors: <strong className="text-emerald-400 font-mono">{stats.totalCitizens}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.topRankedSectors.map((sec, idx) => {
              const def = SECTOR_DEFINITIONS[sec.sectorId];
              return (
                <div
                  key={sec.sectorId}
                  className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#334155] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: sec.chartColor }}
                      >
                        {renderSectorIcon(sec.iconName, 'w-5 h-5')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sec.name}</span>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#1E293B] text-emerald-400 border border-[#334155]">
                            Rank #{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-[#94A3B8] line-clamp-1">{def.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-mono font-bold text-emerald-400">
                        {sec.citizenAvgPct}%
                      </div>
                      <div className="text-xs text-[#94A3B8] font-mono">
                        {formatCompactINR(sec.totalAllocatedAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress comparison bar */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Citizen Demand ({sec.citizenAvgPct}%) vs Govt Actual ({sec.govBenchmarkPct}%)</span>
                      <span
                        className={`font-mono font-bold ${
                          sec.deltaPct > 0 ? 'text-emerald-400' : sec.deltaPct < 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {sec.deltaPct > 0 ? `+${sec.deltaPct}% Deficit (Demand More)` : sec.deltaPct < 0 ? `${sec.deltaPct}% (Demand Less)` : 'Balanced'}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[#0A0B0D] rounded-full overflow-hidden flex border border-[#1E293B]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(sec.citizenAvgPct * 2.5, 100)}%`, backgroundColor: sec.chartColor }}
                      ></div>
                    </div>
                  </div>

                  {/* Subcategories tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1E293B]">
                    {def.subCategories.slice(0, 3).map((sub, i) => (
                      <span key={i} className="text-[10px] bg-[#0A0B0D] text-[#94A3B8] px-2.5 py-1 rounded-lg border border-[#1E293B]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: STATE & METRO PARTICIPATION MATRIX */}
      {selectedViewTab === 'states' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Geographic Distribution</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-white">
                  State-by-State Taxpayer Participation & Top Demands
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Breakdown of citizen contribution capital and primary focus area across participating states
                </p>
              </div>

              <span className="text-xs font-mono font-semibold text-[#94A3B8]">
                {stats.stateBreakdown.length} Active Regions
              </span>
            </div>

            {/* Table of States */}
            <div className="overflow-x-auto border border-[#1E293B] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E293B] text-[#CBD5E1] font-bold border-b border-[#1E293B]">
                  <tr>
                    <th className="py-3.5 px-4">State / Territory</th>
                    <th className="py-3.5 px-4 text-center">Citizen Filings</th>
                    <th className="py-3.5 px-4 text-right">Total Tax Capital</th>
                    <th className="py-3.5 px-4 text-right">Avg Tax / Citizen</th>
                    <th className="py-3.5 px-4">Top Citizen Priority Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {stats.stateBreakdown.map((s, idx) => (
                    <tr key={s.state} className="hover:bg-[#131E32] transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#1E293B] text-[10px] text-emerald-400 font-mono flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{s.state}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-[#E2E8F0]">
                        {s.citizenCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrencyINR(s.totalTaxPaid)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#CBD5E1]">
                        {formatCompactINR(s.avgTaxPerCitizen)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 bg-[#0A0B0D] text-sky-300 px-2.5 py-1 rounded-lg border border-[#1E293B] font-semibold text-[11px]">
                          {renderSectorIcon(SECTOR_DEFINITIONS[s.topSectorId]?.iconName || 'Layers', 'w-3 h-3 text-sky-400')}
                          <span>{s.topSectorName}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: LIVE CITIZEN PROPOSALS & POLICY FEED */}
      {selectedViewTab === 'proposals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-[#94A3B8]">
            <span>Recent Verified Citizen Policy Suggestions & Feedback:</span>
            <span>
              Total Proposals: <strong className="text-amber-400 font-mono">{stats.recentCitizenProposals.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentCitizenProposals.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                        {prop.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{prop.fullName}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          {prop.city}, {prop.state} • FY {prop.financialYear}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {formatCompactINR(prop.taxPaid)} Tax
                    </span>
                  </div>

                  <p className="text-xs text-[#E2E8F0] leading-relaxed italic bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B]">
                    "{prop.citizenProposal}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#1E293B]">
                  <span className="flex items-center gap-1 text-[#94A3B8]">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Top Focus: <strong className="text-emerald-400">{prop.topSector}</strong></span>
                  </span>
                  <span>Verified Filing Hash</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Conversion Banner */}
      <div className="bg-gradient-to-r from-emerald-900/30 via-[#0F172A] to-teal-900/30 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <Landmark className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
          Join India's Participatory Tax Transparency Movement
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
          File your taxes, choose your budget allocations, simulate concrete physical outcomes, and receive your verified cryptographic certificate.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onStartFiling}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Filing FY 2025-26</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onGoToReports}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-semibold text-xs sm:text-sm border border-[#334155] transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Download PDF Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
