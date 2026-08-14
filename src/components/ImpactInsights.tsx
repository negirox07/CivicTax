import React, { useState, useMemo } from 'react';
import {
  Building2,
  HeartPulse,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  Info,
  ArrowUpRight,
  Activity,
  Compass,
  GraduationCap,
  Leaf,
  Tractor,
  Atom,
  ChevronRight,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { SectorAllocations, SectorId, TaxRecord } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';
import { formatCurrencyINR, formatCompactINR } from '../utils/formatters';
import { calculateImpactInsights, ImpactSummaryReport } from '../utils/impactCalculator';

interface ImpactInsightsProps {
  allocations: SectorAllocations;
  taxPaid: number;
  annualSalary?: number;
  fullName?: string;
  city?: string;
  state?: string;
  financialYear?: string;
  citizenProposal?: string;
  onAdjustAllocations?: () => void;
  className?: string;
}

export const ImpactInsights: React.FC<ImpactInsightsProps> = ({
  allocations,
  taxPaid,
  annualSalary = 1800000,
  fullName = 'Citizen Contributor',
  city = 'Bengaluru',
  state = 'Karnataka',
  financialYear = '2025-26',
  citizenProposal = '',
  onAdjustAllocations,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'spotlight' | 'infrastructure' | 'healthcare' | 'all_sectors' | 'community'>('spotlight');
  const [communityScaleIdx, setCommunityScaleIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate comprehensive realistic impact report
  const impactReport: ImpactSummaryReport = useMemo(() => {
    return calculateImpactInsights(allocations, taxPaid, fullName, city, state);
  }, [allocations, taxPaid, fullName, city, state]);

  const { infrastructureSummary, healthcareSummary, sectorBreakdowns, communityMultipliers } = impactReport;

  const currentMultiplier = communityMultipliers[communityScaleIdx] || communityMultipliers[0];

  // Copy narrative to clipboard
  const handleCopySummary = () => {
    const textToCopy = `🏛️ CivicTax Impact Insights (FY ${financialYear})
Taxpayer: ${fullName} | Tax Contribution: ${formatCurrencyINR(taxPaid)}
Location: ${city}, ${state}

🏗️ Public Infrastructure Allocation: ${infrastructureSummary.percentage}% (${formatCurrencyINR(infrastructureSummary.allocatedAmount)})
${infrastructureSummary.headline}
• ${infrastructureSummary.narrative}

🏥 Public Healthcare Allocation: ${healthcareSummary.percentage}% (${formatCurrencyINR(healthcareSummary.allocatedAmount)})
${healthcareSummary.headline}
• ${healthcareSummary.narrative}

🌐 Learn more & direct your tax: CivicTax Public Transparency Ledger`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    <div className={`bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl overflow-hidden ${className}`} id="impact-insights-root">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-7 border-b border-[#1E293B] bg-gradient-to-r from-[#0F172A] via-[#1E293B]/40 to-[#0F172A]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Real-World Civic Transformation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#E2E8F0] font-serif flex items-center gap-2.5">
              <span>Impact Insights</span>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FY {financialYear}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Textual analysis of what your direct tax allocation of{' '}
              <strong className="text-emerald-400 font-mono">{formatCurrencyINR(taxPaid)}</strong> realistically delivers for municipal roads, rapid transit, and public healthcare clinics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="copy-impact-summary-btn"
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] px-3.5 py-2 rounded-xl border border-[#334155] transition active:scale-95 cursor-pointer"
              title="Copy formatted impact summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
              <span>{copied ? 'Summary Copied' : 'Share / Copy Report'}</span>
            </button>

            {onAdjustAllocations && (
              <button
                id="adjust-allocations-btn"
                type="button"
                onClick={onAdjustAllocations}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition active:scale-95 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Allocations</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-2 border-t border-[#1E293B]/70 scrollbar-none">
          <button
            id="tab-spotlight-btn"
            type="button"
            onClick={() => setActiveTab('spotlight')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'spotlight'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E293B]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Infra & Health Spotlight</span>
          </button>

          <button
            id="tab-infrastructure-btn"
            type="button"
            onClick={() => setActiveTab('infrastructure')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'infrastructure'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-extrabold'
                : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E293B]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Public Infrastructure ({infrastructureSummary.percentage}%)</span>
          </button>

          <button
            id="tab-healthcare-btn"
            type="button"
            onClick={() => setActiveTab('healthcare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'healthcare'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20 font-extrabold'
                : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E293B]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Public Healthcare ({healthcareSummary.percentage}%)</span>
          </button>

          <button
            id="tab-all-sectors-btn"
            type="button"
            onClick={() => setActiveTab('all_sectors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all_sectors'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E293B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 8 Sectors</span>
          </button>

          <button
            id="tab-community-btn"
            type="button"
            onClick={() => setActiveTab('community')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-extrabold'
                : 'bg-[#0A0B0D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1E293B]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Multiplier (Scaling)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Selected Tab */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* TAB 1: DUAL SPOTLIGHT (INFRASTRUCTURE + HEALTHCARE) */}
        {activeTab === 'spotlight' && (
          <div className="space-y-6">
            {/* High Level Synthesis Callout */}
            <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0 mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Citizen Fiscal Allocation Synthesis
                </h3>
                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                  {impactReport.overallNarrative}
                </p>
                {citizenProposal && (
                  <div className="mt-3 pt-3 border-t border-[#1E293B] text-xs text-[#94A3B8] italic flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-400 not-italic">Citizen Note:</span>
                    <span>"{citizenProposal}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dual Grid: Infrastructure vs Healthcare */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Infrastructure Card */}
              <div className="bg-gradient-to-br from-[#0A0B0D] to-[#0284c7]/10 border border-sky-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sky-400">
                      <span className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                        <Building2 className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">Public Infrastructure</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {infrastructureSummary.percentage}% ({formatCurrencyINR(infrastructureSummary.allocatedAmount)})
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#E2E8F0] mb-2 font-serif">
                    {infrastructureSummary.headline}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-4">
                    {infrastructureSummary.narrative}
                  </p>

                  {/* Concrete Physical Deliverables Pill List */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Realistic Deliverables Supported:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {infrastructureSummary.deliverables.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="bg-[#0F172A]/90 border border-[#1E293B] p-2.5 rounded-xl">
                          <div className="text-xs font-bold text-sky-400 font-mono">
                            {item.count.toLocaleString()} {item.unit}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('infrastructure')}
                  className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Full Infrastructure Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Healthcare Card */}
              <div className="bg-gradient-to-br from-[#0A0B0D] to-[#e11d48]/10 border border-rose-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-rose-400">
                      <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <HeartPulse className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">Public Healthcare</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {healthcareSummary.percentage}% ({formatCurrencyINR(healthcareSummary.allocatedAmount)})
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#E2E8F0] mb-2 font-serif">
                    {healthcareSummary.headline}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-4">
                    {healthcareSummary.narrative}
                  </p>

                  {/* Concrete Health Deliverables Pill List */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Tangible Medical Outputs:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {healthcareSummary.deliverables.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="bg-[#0F172A]/90 border border-[#1E293B] p-2.5 rounded-xl">
                          <div className="text-xs font-bold text-rose-400 font-mono">
                            {item.count.toLocaleString()} {item.unit}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('healthcare')}
                  className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Full Healthcare Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED INFRASTRUCTURE DEEP DIVE */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            <div className="bg-[#0A0B0D] border border-sky-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#E2E8F0]">
                      Public Infrastructure & Mobility Realism Factsheet
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Benchmarked against Central Public Works Department (CPWD) & Urban Transit Standards
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-[#94A3B8]">Allocated Budget</div>
                  <div className="text-lg font-bold text-sky-400 font-mono">
                    {formatCurrencyINR(infrastructureSummary.allocatedAmount)} ({infrastructureSummary.percentage}%)
                  </div>
                </div>
              </div>

              {/* Textual Narrative */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 mb-6">
                <h4 className="text-sm font-bold text-sky-400 mb-1">
                  {infrastructureSummary.headline}
                </h4>
                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                  {infrastructureSummary.narrative}
                </p>
              </div>

              {/* Detailed Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infrastructureSummary.deliverables.map((d, i) => (
                  <div key={i} className="bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#E2E8F0]">{d.label}</span>
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                          {d.count.toLocaleString()} {d.unit}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-normal">
                        {d.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-Sectors & Regional Projects */}
              <div className="mt-6 pt-5 border-t border-[#1E293B]">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-3">
                  Key Municipal Work Streams Funded in {city}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Arterial Roads & Flyovers</div>
                    <div className="text-[#94A3B8] text-[11px]">Bitumen resurfacing, seismic joints & reflective lane painting.</div>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Urban Stormwater Drainage</div>
                    <div className="text-[#94A3B8] text-[11px]">Reinforced pre-cast concrete box culverts to stop flood overflows.</div>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Clean Public Mobility</div>
                    <div className="text-[#94A3B8] text-[11px]">Subsidized electricity tariffs for metro lines and electric city buses.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DETAILED HEALTHCARE DEEP DIVE */}
        {activeTab === 'healthcare' && (
          <div className="space-y-6">
            <div className="bg-[#0A0B0D] border border-rose-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#E2E8F0]">
                      Public Healthcare & Emergency Relief Factsheet
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Benchmarked against National Health Mission (NHM) & Primary Health Centre (PHC) Standards
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-[#94A3B8]">Allocated Budget</div>
                  <div className="text-lg font-bold text-rose-400 font-mono">
                    {formatCurrencyINR(healthcareSummary.allocatedAmount)} ({healthcareSummary.percentage}%)
                  </div>
                </div>
              </div>

              {/* Textual Narrative */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 mb-6">
                <h4 className="text-sm font-bold text-rose-400 mb-1">
                  {healthcareSummary.headline}
                </h4>
                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                  {healthcareSummary.narrative}
                </p>
              </div>

              {/* Detailed Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {healthcareSummary.deliverables.map((d, i) => (
                  <div key={i} className="bg-[#0F172A] border border-[#1E293B] p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#E2E8F0]">{d.label}</span>
                        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          {d.count.toLocaleString()} {d.unit}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-normal">
                        {d.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Healthcare Impact Pillars */}
              <div className="mt-6 pt-5 border-t border-[#1E293B]">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block mb-3">
                  Out-of-Pocket Cost Reductions Enabled in {state}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Free Diagnostic Panels</div>
                    <div className="text-[#94A3B8] text-[11px]">Prevents low-income citizens from skipping critical blood and liver tests.</div>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Subsidized Dialysis Access</div>
                    <div className="text-[#94A3B8] text-[11px]">Provides weekly hemodialysis for kidney patients with zero clinic fee.</div>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                    <div className="font-bold text-[#E2E8F0] mb-1">Trauma Response Network</div>
                    <div className="text-[#94A3B8] text-[11px]">Sponsors fuel, medicines, and paramedics for golden-hour emergency rescues.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALL 8 SECTORS BREAKDOWN */}
        {activeTab === 'all_sectors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
              <span>Complete Sectoral Real-World Impact Breakdown:</span>
              <span>Total Tax: <strong className="text-emerald-400 font-mono">{formatCurrencyINR(taxPaid)}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectorBreakdowns.map((sec) => {
                const def = SECTOR_DEFINITIONS[sec.sectorId];
                return (
                  <div
                    key={sec.sectorId}
                    className={`p-4 rounded-xl border transition ${
                      sec.percentage > 0
                        ? 'bg-[#0A0B0D] border-[#1E293B] shadow-md'
                        : 'bg-[#0A0B0D]/40 border-[#1E293B]/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: def.chartColor }}
                        >
                          {renderSectorIcon(def.iconName, 'w-3.5 h-3.5')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#E2E8F0]">{def.name}</div>
                          <div className="text-[10px] text-[#94A3B8]">Govt Union Baseline: {def.benchmarkPct}%</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[#E2E8F0] font-mono">{sec.percentage}%</div>
                        <div className="text-[11px] font-semibold text-emerald-400 font-mono">
                          {formatCurrencyINR(sec.allocatedAmount)}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed pt-1 border-t border-[#1E293B]/60">
                      {sec.realisticNarrative}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: COMMUNITY MULTIPLIER (SCALING EFFECT) */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="bg-[#0A0B0D] border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#E2E8F0]">
                    Community Multiplier & Scaled Public Achievements
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Explore what happens when fellow citizens in your neighborhood or city pool their direct tax allocations
                  </p>
                </div>
              </div>

              {/* Scale Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
                {communityMultipliers.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCommunityScaleIdx(idx)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      communityScaleIdx === idx
                        ? 'bg-indigo-600/20 border-indigo-500 text-[#E2E8F0] shadow-md'
                        : 'bg-[#0F172A] border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{m.scaleLabel}</div>
                    <div className="text-[11px] font-mono text-indigo-400 font-semibold mt-0.5">
                      Pool: {formatCompactINR(m.pooledTax)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Multiplier Real-World Outcomes */}
              <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Collective Transformation ({currentMultiplier.scaleLabel}):
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total Civic Fund: {formatCurrencyINR(currentMultiplier.pooledTax)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Infra achievement */}
                  <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-sky-500/20">
                    <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                      <Building2 className="w-4 h-4" />
                      <span>Public Infrastructure Deliverables</span>
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">
                      {currentMultiplier.infraAchievement}
                    </p>
                  </div>

                  {/* Health achievement */}
                  <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-rose-500/20">
                    <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                      <HeartPulse className="w-4 h-4" />
                      <span>Public Healthcare Deliverables</span>
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">
                      {currentMultiplier.healthAchievement}
                    </p>
                  </div>

                  {/* Education achievement */}
                  <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-violet-500/20">
                    <div className="flex items-center gap-2 text-violet-400 font-bold mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Education & STEM Upgrades</span>
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">
                      {currentMultiplier.educationAchievement}
                    </p>
                  </div>

                  {/* Clean energy achievement */}
                  <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <Leaf className="w-4 h-4" />
                      <span>Clean Energy & Solar Microgrids</span>
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">
                      {currentMultiplier.energyAchievement}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Benchmark Bar */}
      <div className="px-6 py-3.5 bg-[#0A0B0D] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Real-world metrics computed using official CPWD civil engineering unit costs and NHM health subsidy schedules.</span>
        </div>
        <span className="font-semibold text-[#94A3B8]">CivicTax Open Governance Project</span>
      </div>
    </div>
  );
};
