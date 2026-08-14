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
import { TaxRecord, SectorId } from '../types';
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
  onStartFiling: () => void;
  onGoToPersonalDashboard: () => void;
  onGoToReports: () => void;
  dataSource: 'SUPABASE' | 'LOCAL_STORAGE';
  onReloadData: () => void;
}

export const GlobalDashboardView: React.FC<GlobalDashboardViewProps> = ({
  records,
  onStartFiling,
  onGoToPersonalDashboard,
  onGoToReports,
  dataSource,
  onReloadData,
}) => {
  const [selectedFY, setSelectedFY] = useState<string>('ALL');
  const [selectedViewTab, setSelectedViewTab] = useState<'consensus' | 'sectors' | 'states' | 'proposals'>('consensus');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Supabase cloud integration status
  const supabaseActive = isSupabaseActive();
  const supabaseConfigured = isSupabaseConfigured();

  // Compute aggregated public interest statistics
  const stats: GlobalPublicStats = useMemo(() => {
    return calculateGlobalPublicStats(records, selectedFY);
  }, [records, selectedFY]);

  // Handle manual Supabase sync
  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncLocalRecordsToSupabase();
      setSyncMessage(result.message);
      if (result.success) {
        onReloadData();
      }
    } catch (err: any) {
      setSyncMessage(err.message || 'Failed to sync to Supabase');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
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

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                id="landing-hero-file-tax-btn"
                type="button"
                onClick={onStartFiling}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>File Tax & Direct Budget</span>
              </button>

              <button
                id="landing-hero-view-dashboard-btn"
                type="button"
                onClick={onGoToPersonalDashboard}
                className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-semibold px-5 py-2.5 rounded-xl border border-[#334155] transition active:scale-95 cursor-pointer text-xs sm:text-sm"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>View My Tracked Filings</span>
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

      {/* Production Supabase & Storage Status Indicator Banner */}
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
                Active Storage Engine:
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
          {syncMessage && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {syncMessage}
            </span>
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
            <Database className="w-3.5 h-3.5" />
            <span>Mode: {supabaseActive ? 'Cloud Active' : 'Local Mock'}</span>
          </button>
        </div>
      </div>

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
