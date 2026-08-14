import React from 'react';
import {
  Landmark,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  GraduationCap,
  HeartPulse,
  Leaf,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';

export const CivicTransparencyView: React.FC = () => {
  // Aggregate Citizen Sentiment vs Official Budget Data
  const consensusComparisonData = [
    {
      sector: 'Healthcare',
      citizenVoice: 26,
      govActual: 14,
      delta: '+12%',
      deltaType: 'deficit', // citizens want more
      notes: 'Citizens strongly urge doubling primary clinic funding and diagnostic subsidies.',
    },
    {
      sector: 'Education',
      citizenVoice: 24,
      govActual: 15,
      delta: '+9%',
      deltaType: 'deficit',
      notes: 'High demand for STEM labs, digital classrooms, and underprivileged scholarships.',
    },
    {
      sector: 'Infrastructure',
      citizenVoice: 20,
      govActual: 22,
      delta: '-2%',
      deltaType: 'aligned',
      notes: 'Balanced consensus on highways, subways, and storm-water drainage resilience.',
    },
    {
      sector: 'Clean Energy',
      citizenVoice: 15,
      govActual: 11,
      delta: '+4%',
      deltaType: 'deficit',
      notes: 'Demand for rapid solar rooftop adoption and urban forest restoration.',
    },
    {
      sector: 'Defense & Security',
      citizenVoice: 7,
      govActual: 18,
      delta: '-11%',
      deltaType: 'surplus',
      notes: 'Citizens prefer focusing defense on modern cyber resilience while prioritizing social health.',
    },
    {
      sector: 'Agriculture & Rural',
      citizenVoice: 8,
      govActual: 9,
      delta: '-1%',
      deltaType: 'aligned',
      notes: 'Support for cold chain storages, solar micro-irrigation, and farmer income safeguards.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#1E293B]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Civic Governance & Fiscal Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#E2E8F0] mb-2">
            Participatory Budgeting & Citizen Consensus Matrix
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Fostering transparency and democratic accountability by matching aggregate citizen tax allocations directly against government union budget spending priorities.
          </p>
        </div>
      </div>

      {/* Aggregate Citizen Consensus vs Government Central Budget Chart */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#E2E8F0] font-serif">
              National Civic Consensus vs Statutory Government Budget
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Aggregated from verified citizen filings across all states versus the current Union fiscal budget
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Citizen Preference Consensus (%)
            </span>
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <span className="w-3 h-3 rounded-xs bg-[#475569]"></span> Official Union Budget (%)
            </span>
          </div>
        </div>

        <div className="h-80 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consensusComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#1E293B' }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#1E293B' }} />
              <RechartsTooltip
                formatter={(val: any, name: any) => [
                  `${val}%`,
                  name === 'citizenVoice' ? 'Citizen Consensus' : 'Govt Union Budget',
                ]}
                contentStyle={{ borderRadius: '12px', backgroundColor: '#0A0B0D', borderColor: '#1E293B', color: '#E2E8F0' }}
              />
              <Bar dataKey="citizenVoice" name="Citizen Consensus" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="govActual" name="Govt Budget" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Gap Breakdown Table */}
        <div className="overflow-x-auto border border-[#1E293B] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E293B] text-[#CBD5E1] font-bold border-b border-[#1E293B]">
              <tr>
                <th className="py-3 px-4">Development Sector</th>
                <th className="py-3 px-4 text-center">Citizen Demand (%)</th>
                <th className="py-3 px-4 text-center">Actual Govt Allocation (%)</th>
                <th className="py-3 px-4 text-center">Fiscal Delta</th>
                <th className="py-3 px-4">Policy Context & Citizen Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {consensusComparisonData.map((row) => (
                <tr key={row.sector} className="hover:bg-[#131E32] transition">
                  <td className="py-3 px-4 font-bold text-[#E2E8F0]">{row.sector}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono text-sm">
                    {row.citizenVoice}%
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-[#CBD5E1] font-mono text-sm">
                    {row.govActual}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                        row.deltaType === 'deficit'
                          ? 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                          : row.deltaType === 'surplus'
                          ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                          : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {row.delta}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#94A3B8]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Pillars of Civic Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#E2E8F0] font-serif">
            1. Verifiable Proof of Contribution
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Every filing generates a cryptographic verification hash with masked identity (PAN & Aadhaar) that can be downloaded as an official tax certificate.
          </p>
        </div>

        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#E2E8F0] font-serif">
            2. Multi-Year Fiscal Accountability
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Track your cumulative tax footprint across years and visualize tangible civic assets (kilometers of roads, student scholarships, solar grids) funded.
          </p>
        </div>

        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#E2E8F0] font-serif">
            3. Participatory Budgeting Voice
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Directly signals citizen priorities to municipalities and state planners, strengthening the democratic bridge between taxpayer and government.
          </p>
        </div>
      </div>
    </div>
  );
};
