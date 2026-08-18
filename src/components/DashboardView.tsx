import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Download,
  Trash2,
  Edit3,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Building2,
  GraduationCap,
  HeartPulse,
  Leaf,
  Tractor,
  Atom,
  Users,
  Eye,
  Ban,
  Sliders,
  Lock,
  ChevronRight,
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
  AreaChart,
  Area,
} from 'recharts';
import { TaxRecord, SectorId } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';
import { ImpactInsights } from './ImpactInsights';
import { SectorSparkline } from './SectorSparkline';
import { SectorHistoricalPoint } from '../utils/dataService';
import {
  formatCurrencyINR,
  formatCompactINR,
  getTaxpayerTier,
} from '../utils/formatters';

interface DashboardViewProps {
  records: TaxRecord[];
  onSelectEdit: (record: TaxRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDownloadPdf: (record: TaxRecord) => void;
  onNewFiling: () => void;
  onViewCertModal: (record: TaxRecord) => void;
  onOpenPrivacyModal?: (tab?: 'download' | 'delete' | 'withdraw' | 'preferences') => void;
  onGoToComplianceCenter?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onSelectEdit,
  onDeleteRecord,
  onDownloadPdf,
  onNewFiling,
  onViewCertModal,
  onOpenPrivacyModal,
  onGoToComplianceCenter,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(
    records.length > 0 ? records[0].financialYear : '2025-26'
  );

  // If no records
  if (records.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-12 shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#E2E8F0] font-serif mb-2">
            No Historical Tax Records Yet
          </h2>
          <p className="text-[#94A3B8] text-sm max-w-md mx-auto mb-6">
            Begin by filling out your first annual tax allocation form to unlock personalized historical analytics, budget comparisons, and verifiable PDF reports.
          </p>
          <button
            onClick={onNewFiling}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Your First Annual Return</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Selected Record for single-year analytics
  const activeRecord = records.find((r) => r.financialYear === selectedYear) || records[0];

  // Lifetime Cumulative Calculations
  const totalLifetimeTax = records.reduce((acc, r) => acc + (Number(r.taxPaid) || 0), 0);
  const avgAnnualTax = Math.round(totalLifetimeTax / records.length);
  const taxpayerTier = getTaxpayerTier(totalLifetimeTax);

  // Find Top Overall Prioritized Sector across all years
  const sectorSums: Record<SectorId, number> = {
    infrastructure: 0,
    education: 0,
    healthcare: 0,
    clean_energy: 0,
    defense_security: 0,
    agriculture_rural: 0,
    science_tech: 0,
    social_welfare: 0,
  };

  records.forEach((r) => {
    ALL_SECTOR_IDS.forEach((secId) => {
      const pct = r.allocations[secId] || 0;
      const amt = (Number(r.taxPaid) * pct) / 100;
      sectorSums[secId] += amt;
    });
  });

  let topSectorId: SectorId = 'infrastructure';
  let maxSectorAmt = 0;
  Object.entries(sectorSums).forEach(([secId, amt]) => {
    if (amt > maxSectorAmt) {
      maxSectorAmt = amt;
      topSectorId = secId as SectorId;
    }
  });

  const topSector = SECTOR_DEFINITIONS[topSectorId];

  // Multi-Year Bar Chart Data (chronological order)
  const historicalTrendData = [...records]
    .sort((a, b) => a.financialYear.localeCompare(b.financialYear))
    .map((r) => ({
      year: `FY ${r.financialYear}`,
      taxPaid: Number(r.taxPaid) || 0,
      salary: Number(r.annualSalary) || 0,
      infrastructure: Math.round(((r.taxPaid || 0) * (r.allocations.infrastructure || 0)) / 100),
      education: Math.round(((r.taxPaid || 0) * (r.allocations.education || 0)) / 100),
      healthcare: Math.round(((r.taxPaid || 0) * (r.allocations.healthcare || 0)) / 100),
      clean_energy: Math.round(((r.taxPaid || 0) * (r.allocations.clean_energy || 0)) / 100),
      others: Math.round(
        ((r.taxPaid || 0) *
          ((r.allocations.defense_security || 0) +
            (r.allocations.agriculture_rural || 0) +
            (r.allocations.science_tech || 0) +
            (r.allocations.social_welfare || 0))) /
          100
      ),
    }));

  // Selected Year Pie Data
  const selectedYearPieData = ALL_SECTOR_IDS.map((secId) => {
    const sec = SECTOR_DEFINITIONS[secId];
    const pct = activeRecord.allocations[secId] || 0;
    const inrValue = Math.round((Number(activeRecord.taxPaid) * pct) / 100);
    return {
      name: sec.shortName,
      fullName: sec.name,
      value: pct,
      inrValue,
      color: sec.chartColor,
    };
  }).filter((d) => d.value > 0);

  // 3-Year Sector Historical Shift Mapping
  const last3Years = ['2023-24', '2024-25', '2025-26'];
  const sectorHistoricalMap = useMemo(() => {
    const map: Record<
      SectorId,
      { points: SectorHistoricalPoint[]; trendPct: number }
    > = {} as any;

    ALL_SECTOR_IDS.forEach((secId) => {
      const def = SECTOR_DEFINITIONS[secId];
      const points: SectorHistoricalPoint[] = last3Years.map((fy) => {
        const rec = records.find((r) => r.financialYear === fy);
        const shortYear = fy.replace('20', '').replace('-20', '-');
        const citizenPct = rec
          ? Number(rec.allocations[secId]) || 0
          : activeRecord.allocations[secId] || def.benchmarkPct;
        return {
          year: fy,
          formattedYear: `FY ${fy}`,
          shortYear,
          citizenAvgPct: citizenPct,
          govBenchmarkPct: def.benchmarkPct,
        };
      });

      const trendPct =
        points.length >= 2
          ? Math.round((points[points.length - 1].citizenAvgPct - points[0].citizenAvgPct) * 10) / 10
          : 0;

      map[secId] = { points, trendPct };
    });

    return map;
  }, [records, activeRecord]);

  // Comparison Data: Citizen vs National Benchmark for selected year
  const comparisonData = ALL_SECTOR_IDS.map((secId) => {
    const sec = SECTOR_DEFINITIONS[secId];
    return {
      sector: sec.shortName,
      citizenPref: activeRecord.allocations[secId] || 0,
      govBenchmark: sec.benchmarkPct,
    };
  });

  // Helper icon renderer
  const renderSectorIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Building2': return <Building2 className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Tractor': return <Tractor className={className} />;
      case 'Atom': return <Atom className={className} />;
      case 'Users': return <Users className={className} />;
      default: return <Building2 className={className} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header with Citizen Tier & Year Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${taxpayerTier.badgeBg} ${taxpayerTier.badgeColor} ${taxpayerTier.borderBadge}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{taxpayerTier.tierName}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <CheckCircle2 className="w-3 h-3" />
              <span>Public Growth & Open Data Consented</span>
            </span>
            <span className="text-xs text-[#64748B]">• {records.length} Recorded Tax Years</span>
          </div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] font-serif">
            {records[0].fullName}'s Civic Tax Portfolio
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Contact: <strong className="text-[#E2E8F0] font-mono">{records[0].email}</strong> • Location: <strong className="text-[#E2E8F0]">{records[0].city}, {records[0].state}</strong> • <span className="text-emerald-400 font-medium">DPDP Act 2023 Compliant</span>
          </p>
        </div>

        {/* Year Filter Switcher & New Filing Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#0A0B0D] p-1 rounded-xl border border-[#1E293B]">
            {records.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedYear(r.financialYear)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedYear === r.financialYear
                    ? 'bg-[#1E293B] text-emerald-400 border border-emerald-500/30 shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                FY {r.financialYear}
              </button>
            ))}
          </div>

          <button
            onClick={onNewFiling}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Year</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lifetime Tax */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Tax Tracked</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold">₹</span>
          </div>
          <div className="text-2xl font-bold text-[#E2E8F0] font-mono">
            {formatCurrencyINR(totalLifetimeTax)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
            Across {records.length} financial returns
          </span>
        </div>

        {/* Average Annual Tax */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Avg Annual Tax</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-[#E2E8F0] font-mono">
            {formatCurrencyINR(avgAnnualTax)}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            ~{formatCurrencyINR(Math.round(avgAnnualTax / 12))} / month avg
          </span>
        </div>

        {/* Top Prioritized Sector */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 shadow-lg">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Top Priority Sector</span>
            <span className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              {renderSectorIcon(topSector.iconName, 'w-4 h-4')}
            </span>
          </div>
          <div className="text-lg font-bold text-[#E2E8F0] truncate">
            {topSector.name}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block font-mono">
            {formatCurrencyINR(maxSectorAmt)} directed over all years
          </span>
        </div>

        {/* Active Year Highlight */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-emerald-500/30 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Selected FY {activeRecord.financialYear}</span>
            <Calendar className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatCurrencyINR(activeRecord.taxPaid)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mt-1">
            <span>Income: {formatCompactINR(activeRecord.annualSalary)}</span>
            <button
              onClick={() => onDownloadPdf(activeRecord)}
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizations: Multi-Year Historical Bar & Selected Year Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Multi-Year Trend Bar & Stack Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#E2E8F0]">
                Multi-Year Tax Contribution & Sector Trend
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Historical tracking of direct tax paid across annual assessment cycles
              </p>
            </div>
            <span className="text-xs font-semibold bg-[#1E293B] text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Historical Bar Chart
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#1E293B' }} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#1E293B' }}
                />
                <RechartsTooltip
                  formatter={(value: any, name: any) => [formatCurrencyINR(Number(value)), name]}
                  contentStyle={{
                    backgroundColor: '#0A0B0D',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94A3B8' }} />
                <Bar dataKey="infrastructure" name="Infrastructure" fill="#0284c7" stackId="a" />
                <Bar dataKey="education" name="Education" fill="#818cf8" stackId="a" />
                <Bar dataKey="healthcare" name="Healthcare" fill="#f43f5e" stackId="a" />
                <Bar dataKey="clean_energy" name="Clean Energy" fill="#10b981" stackId="a" />
                <Bar dataKey="others" name="Other Sectors" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Year Sector Allocation Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-[#E2E8F0]">
                FY {activeRecord.financialYear} Budget Allocation
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Total Tax: <strong className="text-emerald-400 font-mono">{formatCurrencyINR(activeRecord.taxPaid)}</strong>
              </p>
            </div>
            <button
              onClick={() => onViewCertModal(activeRecord)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectedYearPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {selectedYearPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any, _name: any, item: any) => [
                    `${value}% (${formatCurrencyINR(item.payload.inrValue)})`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#E2E8F0',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">FY {activeRecord.financialYear}</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{formatCompactINR(activeRecord.taxPaid)}</span>
            </div>
          </div>

          {/* Quick Legend Matrix */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1E293B] text-xs">
            {selectedYearPieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between bg-[#1E293B]/70 border border-[#334155]/60 p-1.5 rounded-lg">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[#E2E8F0] truncate font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-emerald-400 ml-1 font-mono">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Citizen Choice vs Union Central Budget Benchmark Comparison */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#E2E8F0] flex items-center gap-2">
              <span>Citizen Priority vs Actual Government Union Budget (FY {activeRecord.financialYear})</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Comparing your desired tax allocation against the official central government fiscal allocation
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Your Preference (%)
            </span>
            <span className="flex items-center gap-1 text-[#94A3B8] font-semibold">
              <span className="w-3 h-3 rounded-xs bg-[#64748B]"></span> Govt Benchmark (%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#1E293B' }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#1E293B' }} />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const dataPoint = payload[0]?.payload;
                  return (
                    <div className="bg-[#0A0B0D] border border-[#334155] rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[220px]">
                      <div className="font-bold text-white border-b border-[#1E293B] pb-1.5 flex items-center justify-between">
                        <span>{dataPoint?.sector || label}</span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          FY {activeRecord.financialYear}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                            <span>Your Preference:</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {dataPoint?.citizenPref}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="flex items-center gap-1.5 text-[#94A3B8] font-medium">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#64748B]"></span>
                            <span>Govt Benchmark:</span>
                          </span>
                          <span className="font-mono font-bold text-[#E2E8F0] text-sm">
                            {dataPoint?.govBenchmark}%
                          </span>
                        </div>
                      </div>
                      {dataPoint && (
                        <div className="pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#94A3B8]">Variance vs Govt:</span>
                          <span
                            className={`font-bold ${
                              dataPoint.difference > 0
                                ? 'text-emerald-400'
                                : dataPoint.difference < 0
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {dataPoint.difference > 0
                              ? `+${dataPoint.difference}% (Above Baseline)`
                              : dataPoint.difference < 0
                              ? `${dataPoint.difference}% (Below Baseline)`
                              : 'Aligned'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="citizenPref" name="Your Allocation" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="govBenchmark" name="Govt Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Allocation Breakdown & Historical 3-Year Shift Sparklines */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>3-Year Fiscal Shift Analytics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#E2E8F0]">
              Sector Allocation Breakdown & 3-Year Historical Trends
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Visualizing your active fiscal distribution and multi-year priority shifts across all 8 development sectors.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
            Active: FY {activeRecord.financialYear}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_SECTOR_IDS.map((secId) => {
            const sec = SECTOR_DEFINITIONS[secId];
            const allocPct = activeRecord.allocations[secId] || 0;
            const inrAllocated = Math.round(((Number(activeRecord.taxPaid) || 0) * allocPct) / 100);
            const history = sectorHistoricalMap[secId];

            return (
              <div
                key={secId}
                className="bg-[#0A0B0D] border border-[#1E293B] hover:border-[#334155] rounded-2xl p-4 flex flex-col justify-between transition shadow-md group space-y-3"
              >
                {/* Sector Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: sec.chartColor }}
                      >
                        {renderSectorIcon(sec.iconName, 'w-4 h-4')}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#E2E8F0] block truncate">
                          {sec.shortName}
                        </span>
                        <span className="text-[10px] text-[#64748B] block truncate">
                          Gov: {sec.benchmarkPct}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-emerald-400 block">
                        {allocPct}%
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono block">
                        {formatCompactINR(inrAllocated)}
                      </span>
                    </div>
                  </div>

                  {/* Single Bar Allocation Scale */}
                  <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(allocPct * 3.3, 100)}%`,
                        backgroundColor: sec.chartColor,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Sparkline Visual Component */}
                {history && history.points.length > 0 && (
                  <SectorSparkline
                    data={history.points}
                    color={sec.chartColor}
                    trendPct={history.trendPct}
                    height={36}
                    showLabels={true}
                    showTrendBadge={true}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Realistic Impact Insights for Active Financial Year */}
      <ImpactInsights
        allocations={activeRecord.allocations}
        taxPaid={activeRecord.taxPaid}
        annualSalary={activeRecord.annualSalary}
        fullName={activeRecord.fullName}
        city={activeRecord.city}
        state={activeRecord.state}
        financialYear={activeRecord.financialYear}
        citizenProposal={activeRecord.citizenProposal}
        onAdjustAllocations={() => onSelectEdit(activeRecord)}
      />

      {/* Tangible Civic Impact Simulator Cards */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0B0D] border border-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Tangible Civic Output Simulator
            </span>
            <h2 className="text-xl font-bold font-serif text-[#E2E8F0]">
              What Your Lifetime Tax Contribution of {formatCurrencyINR(totalLifetimeTax)} Funds
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Estimated real-world physical public works, medical treatments, and educational aids enabled by your capital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_SECTOR_IDS.map((secId) => {
            const sec = SECTOR_DEFINITIONS[secId];
            const cumulativeAmt = sectorSums[secId];
            const units = Math.max(0, Math.floor(cumulativeAmt / sec.tangibleUnit.unitCost));

            return (
              <div key={secId} className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: sec.chartColor }}>
                    {renderSectorIcon(sec.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#E2E8F0] block truncate">{sec.shortName}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                      {formatCurrencyINR(cumulativeAmt)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#334155] mt-1">
                  <div className="text-base font-extrabold text-white font-mono">
                    {units.toLocaleString()} Units
                  </div>
                  <div className="text-[11px] text-[#94A3B8] line-clamp-2">
                    {sec.tangibleUnit.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Annual Filings Table */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#E2E8F0] font-serif">
              Annual Tax Records & Verifiable Reports
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Manage your yearly submissions, review allocated breakdown, and generate official downloadable PDF reports.
            </p>
          </div>
          <button
            onClick={onNewFiling}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>File Another Year</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0B0D] text-[#94A3B8] font-semibold border-b border-[#1E293B] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Financial Year</th>
                <th className="py-3.5 px-4">Taxpayer</th>
                <th className="py-3.5 px-4">Gross Income</th>
                <th className="py-3.5 px-4">Tax Contributed</th>
                <th className="py-3.5 px-4">Top Allocation</th>
                <th className="py-3.5 px-4">Filing Date</th>
                <th className="py-3.5 px-4 text-right">PDF Certificate & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {records.map((rec) => {
                // Find top sector for this record
                const allocEntries = Object.entries(rec.allocations) as [SectorId, number][];
                allocEntries.sort((a, b) => b[1] - a[1]);
                const topOne = allocEntries[0];
                const topDef = topOne ? SECTOR_DEFINITIONS[topOne[0]] : null;

                return (
                  <tr key={rec.id} className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#E2E8F0] bg-[#1E293B] px-2 py-1 rounded border border-[#334155]">
                        FY {rec.financialYear}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#E2E8F0]">{rec.fullName}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{rec.email || `${rec.city}, ${rec.state}`}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#E2E8F0] font-medium font-mono">
                      {formatCurrencyINR(rec.annualSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {formatCurrencyINR(rec.taxPaid)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {topDef && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E2E8F0] bg-[#1E293B] border border-[#334155] px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topDef.chartColor }}></span>
                          {topDef.shortName} ({topOne[1]}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8] text-[11px]">
                      {new Date(rec.submissionDate || Date.now()).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download PDF Button */}
                        <button
                          onClick={() => onDownloadPdf(rec)}
                          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                          title="Download Official Verified PDF Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Report</span>
                        </button>

                        {/* View Certificate */}
                        <button
                          onClick={() => onViewCertModal(rec)}
                          className="p-1.5 text-[#94A3B8] hover:text-emerald-400 hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                          title="Inspect Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => onSelectEdit(rec)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                          title="Edit Filing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Record */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete tax record for FY ${rec.financialYear}?`)) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-[#64748B] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account > Privacy Controls Section (DPDP Act 2023) */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#131E32] to-[#0A0B0D] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Account</span>
              <span className="text-xs text-[#64748B]">/</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Privacy & Data Principal Rights
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
              Sovereign Citizen Data Governance & Consent Hub
            </h3>
            <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
              Under India's DPDP Act 2023, you have full sovereign ownership of your data. You can withdraw processing consent in 1-click under Section 6(4), execute permanent deletion under Section 12, or export your full ledger.
            </p>
          </div>

          {onGoToComplianceCenter && (
            <button
              type="button"
              onClick={onGoToComplianceCenter}
              className="self-start sm:self-center shrink-0 text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <span>Full Compliance Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Action 1: Withdraw Consent */}
          <button
            type="button"
            onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('withdraw')}
            className="bg-[#0A0B0D] hover:bg-[#1E293B] border border-amber-500/40 rounded-2xl p-4 text-left transition group cursor-pointer shadow-sm hover:border-amber-400"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Ban className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Sec 6(4)
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              Withdraw Consent
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
              As easy as giving consent. 1-click immediate processing suspension.
            </p>
          </button>

          {/* Action 2: Delete My Data */}
          <button
            type="button"
            onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('delete')}
            className="bg-[#0A0B0D] hover:bg-[#1E293B] border border-rose-500/40 rounded-2xl p-4 text-left transition group cursor-pointer shadow-sm hover:border-rose-400"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                Sec 12
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-rose-300 transition">
              Delete My Data
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
              Permanent purge of all information, filings, and sessions.
            </p>
          </button>

          {/* Action 3: Download My Data */}
          <button
            type="button"
            onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('download')}
            className="bg-[#0A0B0D] hover:bg-[#1E293B] border border-emerald-500/40 rounded-2xl p-4 text-left transition group cursor-pointer shadow-sm hover:border-emerald-400"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Sec 11
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Download My Data
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
              Export complete machine-readable audit package in JSON.
            </p>
          </button>

          {/* Action 4: Privacy Preferences */}
          <button
            type="button"
            onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('preferences')}
            className="bg-[#0A0B0D] hover:bg-[#1E293B] border border-slate-700 rounded-2xl p-4 text-left transition group cursor-pointer shadow-sm hover:border-emerald-400"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Controls
              </span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Privacy Preferences
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
              Granular toggles for cookies, survey modeling, and notices.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
